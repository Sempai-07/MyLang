import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import cliProgress from "cli-progress";

function installPackage(name?: string) {
  const filePath = path.join(process.cwd(), "mylang.json");

  if (!fs.existsSync(filePath)) {
    console.error('Error: "mylang.json" file not found.');
    process.exit(1);
  }

  const myLangJSON = JSON.parse(fs.readFileSync(filePath, "utf8")) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };

  const installedDependencies: string[] = [];
  const installedDevDependencies: string[] = [];

  function installDependency(repo: string, isDev = false) {
    if (typeof repo !== "string") {
      console.error(`Error: Invalid dependency value: ${repo}`);
      process.exit(1);
    }

    const [owner, packageName] = repo.split(":");

    if (!owner || !packageName) {
      console.error(
        `Error: Invalid package format. Expected format: "owner:repository" (received: "${repo}").`
      );
      process.exit(1);
    }

    const modulePath = path.join(".module", owner, packageName);

    if (!fs.existsSync(modulePath)) {
      execSync(
        `git clone --quiet https://github.com/${owner}/${packageName} ${modulePath}`,
        { stdio: "ignore" }
      );
    }

    if (isDev) {
      installedDevDependencies.push(`${owner}/${packageName}`);
    } else {
      installedDependencies.push(`${owner}/${packageName}`);
    }

    return { [packageName]: `${owner}:${packageName}` };
  }

  if (name) {
    console.log(`\nInstalling package ${name}...\n`);
    installDependency(name);
    console.log(`✅ Package ${name} installed successfully.`);
    return;
  }

  const dependencies = Object.values(myLangJSON.dependencies || {});
  const devDependencies = Object.values(myLangJSON.devDependencies || {});
  const allPackages = [...dependencies, ...devDependencies];

  if (!allPackages.length) {
    console.info("No dependencies to install.");
    return;
  }

  console.log("Installing dependencies...");

  const progressBar = new cliProgress.SingleBar({
    format: "[ {bar} {percentage}% ] | {value}/{total} packages",
    barCompleteChar: "=",
    barIncompleteChar: ".",
    hideCursor: true,
  });

  progressBar.start(allPackages.length, 0);

  dependencies.forEach((repo, index) => {
    installDependency(repo);
    progressBar.update(index + 1);
  });

  devDependencies.forEach((repo, index) => {
    installDependency(repo, true);
    progressBar.update(dependencies.length + index + 1);
  });

  progressBar.stop();

  if (installedDependencies.length) {
    console.info("- Installed dependencies:");
    installedDependencies.forEach((dep) => console.info(`  + ${dep}`));
  }

  if (installedDevDependencies.length) {
    console.info("\n- Installed dev dependencies:");
    installedDevDependencies.forEach((dep) => console.info(`  + ${dep}`));
  }
}

export { installPackage };
