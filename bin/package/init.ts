import fs from "node:fs/promises";
import path from "node:path";
import readline from "node:readline/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { cyan, green, yellow, red, dim } from "./utils/utils";

const execFileAsync = promisify(execFile);

interface InitOptions {
  yes?: boolean;
}

interface Answers {
  name: string;
  version: string;
  description: string;
  author: string;
  license: string;
  repository: string;
  keywords: string[];
  main: string;
}

interface PreviousConfig {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

const ENTRY_TEMPLATE = "";

const IGNORE_ENTRIES = [".module/", ".mylang/"];
const SEMVER = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;
const NAME_RE = /^[a-z0-9][a-z0-9._-]*$/;

class CancelError extends Error {}

async function exists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function git(args: string[], cwd: string): Promise<string | undefined> {
  try {
    const { stdout } = await execFileAsync("git", args, { cwd, timeout: 3000 });
    return stdout.trim() || undefined;
  } catch {
    return undefined;
  }
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^[^a-z0-9]+/, "")
    .replace(/-+$/, "");
}

function normalizeRepoUrl(raw: string): string {
  let url = raw.trim().replace(/^git\+/, "");
  const scp = url.match(/^git@([^:]+):(.+)$/);
  if (scp) url = `https://${scp[1]}/${scp[2]}`;
  return url.replace(/^ssh:\/\/git@/, "https://").replace(/\.git$/, "");
}

async function detectDefaults(root: string): Promise<Answers> {
  const [gitName, gitEmail, remote] = await Promise.all([
    git(["config", "user.name"], root),
    git(["config", "user.email"], root),
    git(["remote", "get-url", "origin"], root),
  ]);

  return {
    name: slugify(path.basename(root)) || "my-project",
    version: "1.0.0",
    description: "A MyLang project",
    author: gitName ? (gitEmail ? `${gitName} <${gitEmail}>` : gitName) : "",
    license: "MIT",
    repository: remote ? normalizeRepoUrl(remote) : "",
    keywords: [],
    main: "index.ml",
  };
}

async function readPrevious(filePath: string): Promise<PreviousConfig> {
  try {
    const config = JSON.parse(await fs.readFile(filePath, "utf8"));
    return { dependencies: config.dependencies, devDependencies: config.devDependencies };
  } catch {
    return {};
  }
}

function buildConfig(a: Answers, previous: PreviousConfig): Record<string, unknown> {
  const hasDev = previous.devDependencies && Object.keys(previous.devDependencies).length > 0;

  return {
    name: a.name,
    version: a.version,
    description: a.description,
    ...(a.author ? { author: a.author } : {}),
    license: a.license,
    ...(a.repository ? { repository: a.repository } : {}),
    ...(a.keywords.length ? { keywords: a.keywords } : {}),
    main: a.main,
    scripts: {
      start: `mylang ${a.main}`,
      dev: `mylang ${a.main} --watch`,
    },
    dependencies: previous.dependencies ?? {},
    ...(hasDev ? { devDependencies: previous.devDependencies } : {}),
  };
}

async function missingIgnoreEntries(root: string): Promise<string[]> {
  const content = await fs.readFile(path.join(root, ".gitignore"), "utf8").catch(() => "");

  const present = new Set(
    content.split(/\r?\n/).map((l) => l.trim().replace(/^\//, "").replace(/\/$/, "")),
  );
  return IGNORE_ENTRIES.filter((e) => !present.has(e.replace(/\/$/, "")));
}

async function appendIgnore(root: string, entries: string[]): Promise<void> {
  const filePath = path.join(root, ".gitignore");
  let content = "";
  try {
    content = await fs.readFile(filePath, "utf8");
  } catch {
    /* создадим новый */
  }
  const prefix = content && !content.endsWith("\n") ? "\n" : "";
  const gap = content ? "\n" : "";
  await fs.writeFile(filePath, `${content}${prefix}${gap}# MyLang\n${entries.join("\n")}\n`);
}

function createPrompter() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ac = new AbortController();
  let finished = false;

  rl.on("close", () => {
    if (!finished) ac.abort();
  });

  async function ask(
    label: string,
    def?: string,
    validate?: (value: string) => string | undefined,
  ): Promise<string> {
    for (;;) {
      const suffix = def ? dim(` (${def})`) : "";
      let answer: string;
      try {
        answer = (
          await rl.question(`${cyan("?")} ${label}${suffix} `, { signal: ac.signal })
        ).trim();
      } catch (err) {
        if ((err as Error).name === "AbortError") throw new CancelError();
        throw err;
      }
      const value = answer || def || "";
      const error = validate?.(value);
      if (error) {
        console.log(`  ${red("✗")} ${error}`);
        continue;
      }
      return value;
    }
  }

  async function confirm(label: string, def = true): Promise<boolean> {
    const hint = def ? "Y/n" : "y/N";
    const value = (
      await ask(`${label} ${dim(`[${hint}]`)}`, undefined, (v) =>
        /^(|y|yes|n|no)$/i.test(v) ? undefined : "Answer y or n",
      )
    ).toLowerCase();
    return value === "" ? def : value.startsWith("y");
  }

  function close() {
    finished = true;
    rl.close();
  }

  return { ask, confirm, close };
}

const validators = {
  name: (v: string) =>
    NAME_RE.test(v) ? undefined : "Use lowercase letters, digits, '.', '_' or '-'",
  version: (v: string) => (SEMVER.test(v) ? undefined : "Use semver, e.g. 1.0.0"),
  main: (v: string) => {
    if (!v.endsWith(".ml")) return "Entry file must end with .ml";
    if (path.isAbsolute(v) || v.split(/[\\/]/).includes("..")) {
      return "Use a relative path inside the project";
    }
    return undefined;
  },
};

interface Plan {
  createEntry: boolean;
  updateIgnore: string[];
}

async function writeProject(
  root: string,
  config: Record<string, unknown>,
  answers: Answers,
  plan: Plan,
): Promise<void> {
  await fs.writeFile(path.join(root, "mylang.json"), JSON.stringify(config, null, 2) + "\n");
  console.log(`  ${green("✓")} mylang.json`);

  if (plan.createEntry) {
    const entryPath = path.join(root, answers.main);
    await fs.mkdir(path.dirname(entryPath), { recursive: true });
    await fs.writeFile(entryPath, ENTRY_TEMPLATE);
    console.log(`  ${green("✓")} ${answers.main}`);
  }

  if (plan.updateIgnore.length) {
    await appendIgnore(root, plan.updateIgnore);
    console.log(`  ${green("✓")} .gitignore ${dim(`(+ ${plan.updateIgnore.join(", ")})`)}`);
  }
}

function printNextSteps() {
  console.log(`\n${cyan("Next steps")}`);
  console.log(`  ${cyan("mylang run start")}          run the project`);
  console.log(`  ${cyan("mylang run dev")}            re-run on changes`);
  console.log(`  ${cyan("mylang install owner:repo")} add a package`);
  console.log(`  ${cyan("mylang info")}               see project overview`);
}

async function packageInt(options: InitOptions = {}): Promise<void> {
  const root = process.cwd();
  const filePath = path.join(root, "mylang.json");
  const fileExists = await exists(filePath);
  const defaults = await detectDefaults(root);
  const isGitProject =
    (await exists(path.join(root, ".git"))) || (await exists(path.join(root, ".gitignore")));

  if (options.yes) {
    if (fileExists) throw new Error('"mylang.json" already exists.');

    console.log(cyan("Initializing project with default settings..."));
    const config = buildConfig(defaults, {});
    const plan: Plan = {
      createEntry: !(await exists(path.join(root, defaults.main))),
      updateIgnore: isGitProject ? await missingIgnoreEntries(root) : [],
    };
    await writeProject(root, config, defaults, plan);
    printNextSteps();
    return;
  }

  const prompter = createPrompter();
  try {
    console.log(`${cyan("MyLang init")}`);
    console.log(dim("Press Enter to accept the default in parentheses. Ctrl+C to cancel.\n"));

    let previous: PreviousConfig = {};
    if (fileExists) {
      const overwrite = await prompter.confirm(
        `${yellow('"mylang.json" already exists.')} Overwrite?`,
        false,
      );
      if (!overwrite) {
        console.log(yellow("Cancelled."));
        return;
      }
      previous = await readPrevious(filePath);
      console.log(dim("  Existing dependencies will be kept.\n"));
    }

    const { ask, confirm } = prompter;
    const answers: Answers = {
      name: await ask("Project name:", defaults.name, validators.name),
      version: await ask("Version:", defaults.version, validators.version),
      description: await ask("Description:", defaults.description),
      author: await ask("Author:", defaults.author || undefined),
      license: await ask("License:", defaults.license),
      repository: await ask("Repository:", defaults.repository || undefined),
      keywords: [],
      main: "",
    };

    const rawKeywords = await ask("Keywords (comma separated):");
    answers.keywords = [
      ...new Set(
        rawKeywords
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean),
      ),
    ];
    answers.main = await ask("Entry file:", defaults.main, validators.main);

    const config = buildConfig(answers, previous);

    console.log(`\n${cyan("mylang.json")}`);
    console.log(
      JSON.stringify(config, null, 2)
        .split("\n")
        .map((line) => `  ${line}`)
        .join("\n"),
    );
    console.log();

    if (!(await confirm("Write this file?"))) {
      console.log(yellow("Cancelled."));
      return;
    }

    const plan: Plan = { createEntry: false, updateIgnore: [] };

    if (!(await exists(path.join(root, answers.main)))) {
      plan.createEntry = await confirm(`Create ${cyan(answers.main)}?`);
    }

    if (isGitProject) {
      const missing = await missingIgnoreEntries(root);
      if (missing.length && (await confirm(`Add ${cyan(missing.join(", "))} to .gitignore?`))) {
        plan.updateIgnore = missing;
      }
    }

    console.log();
    await writeProject(root, config, answers, plan);
    printNextSteps();
  } catch (err) {
    if (err instanceof CancelError) {
      console.log(`\n${yellow("Cancelled.")}`);
      process.exitCode = 130;
      return;
    }
    throw err;
  } finally {
    prompter.close();
  }
}

export { packageInt };
