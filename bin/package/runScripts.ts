import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

interface MyLangJSON {
  scripts?: Record<string, string>;
  [key: string]: any;
}

async function readConfig(root: string): Promise<MyLangJSON> {
  const filePath = path.join(root, "mylang.json");
  let raw: string;

  try {
    raw = await fs.readFile(filePath, "utf8");
  } catch {
    throw new Error('"mylang.json" not found in the current directory. Run `mylang init` first.');
  }
  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`Failed to parse mylang.json: ${err instanceof Error ? err.message : err}`);
  }
}

function getScripts(config: MyLangJSON): Record<string, string> {
  const scripts = config.scripts;

  if (!scripts || typeof scripts !== "object") return {};

  return Object.fromEntries(
    Object.entries(scripts).filter(([, cmd]) => typeof cmd === "string"),
  ) as Record<string, string>;
}

function quote(arg: string): string {
  if (process.platform === "win32") return `"${arg.replace(/"/g, '\\"')}"`;
  return `'${arg.replace(/'/g, `'\\''`)}'`;
}

function runShell(command: string, cwd: string, env: NodeJS.ProcessEnv): Promise<number> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, { shell: true, stdio: "inherit", cwd, env });
    child.on("error", reject);
    child.on("close", (code, signal) => resolve(code ?? (signal ? 1 : 0)));
  });
}

async function listScripts(): Promise<void> {
  const config = await readConfig(process.cwd());
  const scripts = getScripts(config);
  const names = Object.keys(scripts);

  if (!names.length) {
    console.log("No scripts defined in mylang.json.");
    return;
  }

  const width = Math.max(...names.map((n) => n.length));

  console.log("Available scripts:");

  for (const name of names) {
    console.log(`  \x1b[36m${name.padEnd(width)}\x1b[0m  ${scripts[name]}`);
  }
}

async function packageScripts(name?: string, args: string[] = []): Promise<void> {
  if (!name) {
    await listScripts();
    return;
  }

  const root = process.cwd();
  const config = await readConfig(root);
  const scripts = getScripts(config);

  if (!(name in scripts)) {
    const available = Object.keys(scripts);

    throw new Error(
      `Script "${name}" not found.` +
        (available.length
          ? ` Available: ${available.join(", ")}`
          : " No scripts defined in mylang.json."),
    );
  }

  const env: NodeJS.ProcessEnv = { ...process.env, MYLANG_SCRIPT: name };

  const steps: { label: string; command: string }[] = [];

  if (scripts[`pre${name}`]) steps.push({ label: `pre${name}`, command: scripts[`pre${name}`]! });

  steps.push({
    label: name,
    command: args.length ? `${scripts[name]} ${args.map(quote).join(" ")}` : scripts[name]!,
  });

  if (scripts[`post${name}`])
    steps.push({ label: `post${name}`, command: scripts[`post${name}`]! });

  for (const step of steps) {
    console.log(`\x1b[36m> ${step.label}: ${step.command}\x1b[0m`);

    const code = await runShell(step.command, root, env);

    if (code !== 0) {
      process.exitCode = code;
      throw new Error(`Script "${step.label}" exited with code ${code}`);
    }
  }
}

export { packageScripts, listScripts };
