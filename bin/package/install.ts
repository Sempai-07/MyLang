import fs from "node:fs";
import path from "node:path";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import cliProgress from "cli-progress";

const execAsync = promisify(exec);

interface InstallOptions {
  dev?: boolean;
  concurrency?: number;
}

const MODULES_DIR = ".module";
const DEFAULT_CONCURRENCY = 6;

function parsePackageRef(ref: string): { owner: string; packageName: string; gitRef?: string } {
  const [ownerRepo, gitRef] = ref.split("@");
  const [owner, packageName] = ownerRepo!.split(":");

  if (!owner || !packageName) {
    throw new Error(
      `Invalid package format: "${ref}". Expected "owner:repository" or "owner:repository@ref".`,
    );
  }

  return { owner, packageName, ...(gitRef && { gitRef }) };
}

async function cloneOne(
  rawRef: string,
): Promise<{ owner: string; packageName: string; skipped: boolean }> {
  const { owner, packageName, gitRef } = parsePackageRef(rawRef);
  const modulePath = path.join(MODULES_DIR, owner, packageName);

  if (fs.existsSync(modulePath)) {
    return { owner, packageName, skipped: true };
  }

  fs.mkdirSync(path.dirname(modulePath), { recursive: true });

  try {
    await execAsync(
      `git clone --quiet --depth 1 https://github.com/${owner}/${packageName} "${modulePath}"`,
    );
    if (gitRef) {
      await execAsync(`git -C "${modulePath}" fetch --quiet --depth 1 origin ${gitRef}`);
      await execAsync(`git -C "${modulePath}" checkout --quiet ${gitRef}`);
    }
  } catch (err) {
    fs.rmSync(modulePath, { recursive: true, force: true });
    throw new Error(`Failed to install "${owner}/${packageName}": ${(err as Error).message}`);
  }

  return { owner, packageName, skipped: false };
}

async function runWithConcurrency<T>(
  items: string[],
  worker: (item: string) => Promise<T>,
  concurrency: number,
  onProgress: () => void,
): Promise<T[]> {
  const results: T[] = new Array(items.length);
  let cursor = 0;

  async function next(): Promise<void> {
    const index = cursor++;
    if (index >= items.length) return;
    results[index] = await worker(items[index]!);
    onProgress();
    return next();
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, next));
  return results;
}

function readConfig(filePath: string): MyLangJSON {
  if (!fs.existsSync(filePath)) {
    throw new Error('"mylang.json" not found in the current directory. Run `mylang init` first.');
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeConfig(filePath: string, config: MyLangJSON) {
  fs.writeFileSync(filePath, JSON.stringify(config, null, 2) + "\n");
}

async function installPackage(name?: string, options: InstallOptions = {}): Promise<void> {
  const filePath = path.join(process.cwd(), "mylang.json");
  const config = readConfig(filePath);
  const concurrency = options.concurrency ?? DEFAULT_CONCURRENCY;

  if (name) {
    const { owner, packageName } = parsePackageRef(name);
    console.log(`Installing ${owner}/${packageName}...`);

    const result = await cloneOne(name);

    const bucket = options.dev ? "devDependencies" : "dependencies";
    config[bucket] = { ...(config[bucket] || {}), [result.packageName]: name };
    writeConfig(filePath, config);

    console.log(
      result.skipped
        ? `\x1b[33m~ ${owner}/${packageName} already installed.\x1b[0m`
        : `\x1b[32m✓ ${owner}/${packageName} installed.\x1b[0m`,
    );
    return;
  }

  const dependencies = Object.values(config.dependencies || {}) as string[];
  const devDependencies = Object.values(config.devDependencies || {}) as string[];
  const allPackages = [...dependencies, ...devDependencies];

  if (!allPackages.length) {
    console.log("Nothing to install.");
    return;
  }

  console.log(`Installing ${allPackages.length} package(s)...`);

  const progressBar = new cliProgress.SingleBar({
    format: "[ {bar} ] {percentage}% | {value}/{total} | {duration_formatted}",
    barCompleteChar: "█",
    barIncompleteChar: "░",
    hideCursor: true,
  });
  progressBar.start(allPackages.length, 0);

  const installed: string[] = [];
  const skipped: string[] = [];
  const failed: { ref: string; error: string }[] = [];

  await runWithConcurrency(
    allPackages,
    async (ref) => {
      try {
        const result = await cloneOne(ref);
        (result.skipped ? skipped : installed).push(`${result.owner}/${result.packageName}`);
      } catch (err) {
        failed.push({ ref, error: (err as Error).message });
      }
    },
    concurrency,
    () => progressBar.increment(),
  );

  progressBar.stop();

  if (installed.length) {
    console.log("\n\x1b[32m✓ Installed:\x1b[0m");
    installed.forEach((dep) => console.log(`  + ${dep}`));
  }
  if (skipped.length) {
    console.log("\n\x1b[33m~ Already present:\x1b[0m");
    skipped.forEach((dep) => console.log(`  = ${dep}`));
  }
  if (failed.length) {
    console.log("\n\x1b[31m✗ Failed:\x1b[0m");
    failed.forEach(({ ref, error }) => console.log(`  - ${ref}: ${error}`));
    process.exitCode = 1;
  }
}

export { installPackage };
