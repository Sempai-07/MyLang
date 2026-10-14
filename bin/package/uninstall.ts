import fs from "node:fs/promises";
import path from "node:path";

interface MyLangJSON {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  [key: string]: any;
}

const MODULES_DIR = ".module";
const BUCKETS = ["dependencies", "devDependencies"] as const;
const SAFE_NAME = /^[\w.-]+$/;

async function exists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

function assertSafe(name: string, label: string) {
  if (!SAFE_NAME.test(name) || name === "." || name === "..") {
    throw new Error(`Invalid ${label}: "${name}"`);
  }
}

function parseRef(ref: string): { owner?: string; packageName: string } {
  const [ownerRepo] = ref.split("@");
  const parts = ownerRepo!.split(":");

  if (parts.length === 1) {
    assertSafe(parts[0]!, "package name");
    return { packageName: parts[0]! };
  }
  const [owner, packageName] = parts;
  if (parts.length !== 2 || !owner || !packageName) {
    throw new Error(
      `Invalid package format: "${ref}". Expected "owner:repository" or "repository".`,
    );
  }
  assertSafe(owner, "owner");
  assertSafe(packageName, "package name");
  return { owner, packageName };
}

async function readConfig(filePath: string): Promise<MyLangJSON> {
  if (!(await exists(filePath))) {
    throw new Error('"mylang.json" not found in the current directory. Run `mylang init` first.');
  }
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

async function resolveOwner(config: MyLangJSON, packageName: string): Promise<string> {
  const owners = new Set<string>();

  for (const bucket of BUCKETS) {
    const stored = config[bucket]?.[packageName];
    if (typeof stored === "string") {
      const owner = stored.split("@")[0]!.split(":")[0];
      if (owner) owners.add(owner);
    }
  }

  if (!owners.size && (await exists(MODULES_DIR))) {
    const entries = await fs.readdir(MODULES_DIR, { withFileTypes: true });
    const checks = await Promise.all(
      entries.map(async (entry) => ({
        name: entry.name,
        found:
          entry.isDirectory() && (await exists(path.join(MODULES_DIR, entry.name, packageName))),
      })),
    );
    for (const { name, found } of checks) {
      if (found) owners.add(name);
    }
  }

  if (!owners.size) throw new Error(`Package "${packageName}" is not installed.`);
  if (owners.size > 1) {
    const list = [...owners].map((o) => `${o}:${packageName}`).join(", ");
    throw new Error(`Ambiguous package "${packageName}". Specify the owner: ${list}`);
  }
  return [...owners][0]!;
}

async function uninstallPackage(ref?: string): Promise<void> {
  if (!ref) {
    throw new Error("Specify a package: mylang uninstall <owner:repo | repo>");
  }

  const filePath = path.join(process.cwd(), "mylang.json");
  const config = await readConfig(filePath);

  const parsed = parseRef(ref);
  const packageName = parsed.packageName;
  const owner = parsed.owner ?? (await resolveOwner(config, packageName));

  let removedDir = false;
  const removedFrom: string[] = [];

  const modulePath = path.join(MODULES_DIR, owner, packageName);
  if (await exists(modulePath)) {
    await fs.rm(modulePath, { recursive: true, force: true });
    removedDir = true;

    const ownerDir = path.join(MODULES_DIR, owner);
    if ((await exists(ownerDir)) && (await fs.readdir(ownerDir)).length === 0) {
      await fs.rmdir(ownerDir);
    }
  }

  for (const bucket of BUCKETS) {
    const stored = config[bucket]?.[packageName];
    if (typeof stored !== "string") continue;

    const storedOwner = stored.split("@")[0]!.split(":")[0];
    if (storedOwner === owner) {
      delete config[bucket]![packageName];
      removedFrom.push(bucket);
    }
  }

  if (removedFrom.length) {
    await fs.writeFile(filePath, JSON.stringify(config, null, 2) + "\n");
  }

  if (!removedDir && !removedFrom.length) {
    throw new Error(`Package "${owner}/${packageName}" is not installed.`);
  }

  console.log(`\x1b[32m✓ ${owner}/${packageName} removed.\x1b[0m`);

  if (!removedDir) {
    console.log(`\x1b[33m~ Files were not found in ${MODULES_DIR}, config entry removed.\x1b[0m`);
  }

  if (!removedFrom.length) {
    console.log(`\x1b[33m~ Not listed in mylang.json, files removed.\x1b[0m`);
  }
}

export { uninstallPackage };
