import fs from "node:fs/promises";
import path from "node:path";
import { cyan, green, yellow, red, dim } from "./utils/utils";

interface InfoOptions {
  json?: boolean;
}

const MODULES_DIR = ".module";
const CACHE_DIR = path.join(".mylang", "cache");
const LABEL_WIDTH = 13;
const row = (label: string, value: string) => `  ${cyan(label.padEnd(LABEL_WIDTH))} ${value}`;
const missing = dim("-");

async function exists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function readConfig(root: string): Promise<MyLangJSON | null> {
  const filePath = path.join(root, "mylang.json");

  let raw: string;
  try {
    raw = await fs.readFile(filePath, "utf8");
  } catch {
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`Failed to parse mylang.json: ${err instanceof Error ? err.message : err}`);
  }
}

function formatAuthor(author: MyLangJSON["author"]): string | undefined {
  if (!author) return undefined;
  if (typeof author === "string") return author;
  const parts = [author.name, author.email && `<${author.email}>`, author.url && `(${author.url})`];
  return parts.filter(Boolean).join(" ") || undefined;
}

function formatRepo(repo: MyLangJSON["repository"]): string | undefined {
  if (!repo) return undefined;
  return typeof repo === "string" ? repo : repo.url;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;

  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let i = 0;

  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }
  return `${value.toFixed(1)} ${units[i]}`;
}

async function dirStats(dir: string): Promise<{ size: number; files: number }> {
  let entries;

  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return { size: 0, files: 0 };
  }

  let size = 0;
  let files = 0;

  for (const entry of entries) {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      const sub = await dirStats(full);

      size += sub.size;
      files += sub.files;
    } else if (entry.isFile()) {
      size += (await fs.stat(full)).size;
      files++;
    }
  }
  return { size, files };
}

async function describeDep(ref: string) {
  const [ownerRepo, gitRef] = ref.split("@");
  const [owner, repo] = (ownerRepo ?? "").split(":");
  const installed = owner && repo ? await exists(path.join(MODULES_DIR, owner, repo)) : false;

  return { owner, repo, gitRef, installed, ref };
}

async function printDeps(title: string, deps: Record<string, string> | undefined) {
  const entries = Object.values(deps ?? {});

  if (!entries.length) return;

  console.log(`\n${cyan(`${title} (${entries.length})`)}`);

  const described = await Promise.all(entries.map(describeDep));

  for (const dep of described) {
    const name = dep.owner && dep.repo ? `${dep.owner}/${dep.repo}` : dep.ref;
    const version = dep.gitRef ? dim(` @${dep.gitRef}`) : "";

    console.log(
      dep.installed
        ? `  ${green("✓")} ${name}${version}`
        : `  ${red("✗")} ${name}${version} ${yellow("(not installed, run `mylang install`)")}`,
    );
  }
}

async function showInfo(mylangVersion: string, options: InfoOptions = {}): Promise<void> {
  const root = process.cwd();
  const config = await readConfig(root);

  if (!config) {
    console.log(yellow("No mylang.json found in the current directory."));
    console.log(`Run ${cyan("mylang init")} to create a project.`);
    return;
  }

  const entry = config.main ?? config.entry;
  const scripts = config.scripts ?? {};
  const cache = await dirStats(path.join(root, CACHE_DIR));

  if (options.json) {
    console.log(
      JSON.stringify(
        {
          name: config.name,
          version: config.version,
          description: config.description,
          author: formatAuthor(config.author),
          license: config.license,
          repository: formatRepo(config.repository),
          homepage: config.homepage,
          keywords: config.keywords,
          entry,
          scripts,
          dependencies: config.dependencies ?? {},
          devDependencies: config.devDependencies ?? {},
          environment: {
            mylang: mylangVersion,
            node: process.version,
            platform: `${process.platform} ${process.arch}`,
            cwd: root,
          },
          cache,
        },
        null,
        2,
      ),
    );
    return;
  }

  console.log(cyan("Project"));
  console.log(row("Name:", config.name ?? missing));
  console.log(row("Version:", config.version ?? missing));
  console.log(row("Description:", config.description ?? missing));
  console.log(row("Author:", formatAuthor(config.author) ?? missing));
  console.log(row("License:", config.license ?? missing));
  console.log(row("Repository:", formatRepo(config.repository) ?? missing));
  console.log(row("Homepage:", config.homepage ?? missing));
  console.log(row("Keywords:", config.keywords?.length ? config.keywords.join(", ") : missing));

  if (entry) {
    const ok = await exists(path.join(root, entry));

    console.log(row("Entry:", `${entry} ${ok ? green("✓") : red("✗ file not found")}`));
  } else {
    console.log(row("Entry:", missing));
  }

  const scriptNames = Object.keys(scripts);

  console.log(`\n${cyan(`Scripts (${scriptNames.length})`)}`);

  if (scriptNames.length) {
    const width = Math.max(...scriptNames.map((n) => n.length));

    for (const name of scriptNames) {
      console.log(`  ${cyan(name.padEnd(width))}  ${scripts[name]}`);
    }

    console.log(dim(`  run with: mylang run <script>`));
  } else {
    console.log(`  ${missing}`);
  }

  await printDeps("Dependencies", config.dependencies);
  await printDeps("Dev dependencies", config.devDependencies);

  console.log(`\n${cyan("Environment")}`);
  console.log(row("MyLang:", `v${mylangVersion}`));
  console.log(row("Node:", process.version));
  console.log(row("Platform:", `${process.platform} ${process.arch}`));
  console.log(row("Directory:", root));
  console.log(
    row("Cache:", cache.files ? `${formatBytes(cache.size)} (${cache.files} files)` : dim("empty")),
  );

  const recommended = ["description", "author", "license", "repository", "keywords"] as const;
  const absent = recommended.filter((key) => {
    const value = config[key];
    return value === undefined || value === "" || (Array.isArray(value) && !value.length);
  });
  if (absent.length) {
    console.log(`\n${yellow("Tip:")} add to mylang.json: ${absent.join(", ")}`);
  }
}

export { showInfo };
