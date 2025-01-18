import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

function packageScripts(script: string) {
  const filePath = path.join(process.cwd(), "mylang.json");

  if (!fs.existsSync(filePath)) {
    console.error('Error: "mylang.json" not exists.');
    process.exit(1);
  }

  const packageJSON = JSON.parse(fs.readFileSync(filePath).toString());

  if (!packageJSON?.scripts || !packageJSON.scripts[script]) {
    console.error(`Error: missing script: "${script}"`);
    process.exit(1);
  }

  const command = packageJSON.scripts[script];

  console.log();
  console.log(`> ${script}`);
  console.log(`> ${command}`);

  try {
    execSync(command, { stdio: "inherit" });
  } catch (err) {
    console.log();
    console.error(err);
    console.log();
    console.error(`> Script "${script}" failed.`);
    process.exit(1);
  }
}

export { packageScripts };
