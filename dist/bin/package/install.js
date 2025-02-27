"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.installPackage = installPackage;
const tslib_1 = require("tslib");
const node_fs_1 = tslib_1.__importDefault(require("node:fs"));
const node_path_1 = tslib_1.__importDefault(require("node:path"));
const node_child_process_1 = require("node:child_process");
const cli_progress_1 = tslib_1.__importDefault(require("cli-progress"));
function installPackage(name) {
    const filePath = node_path_1.default.join(process.cwd(), "mylang.json");
    if (!node_fs_1.default.existsSync(filePath)) {
        console.error('Error: "mylang.json" file not found.');
        process.exit(1);
    }
    const myLangJSON = JSON.parse(node_fs_1.default.readFileSync(filePath, "utf8"));
    const installedDependencies = [];
    const installedDevDependencies = [];
    function installDependency(repo, isDev = false) {
        if (typeof repo !== "string") {
            console.error(`Error: Invalid dependency value: ${repo}`);
            process.exit(1);
        }
        const [owner, packageName] = repo.split(":");
        if (!owner || !packageName) {
            console.error(`Error: Invalid package format. Expected format: "owner:repository" (received: "${repo}").`);
            process.exit(1);
        }
        const modulePath = node_path_1.default.join(".module", owner, packageName);
        if (!node_fs_1.default.existsSync(modulePath)) {
            (0, node_child_process_1.execSync)(`git clone --quiet https://github.com/${owner}/${packageName} ${modulePath}`, { stdio: "ignore" });
        }
        if (isDev) {
            installedDevDependencies.push(`${owner}/${packageName}`);
        }
        else {
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
    const progressBar = new cli_progress_1.default.SingleBar({
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
