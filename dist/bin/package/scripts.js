"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.packageScripts = packageScripts;
const tslib_1 = require("tslib");
const node_fs_1 = tslib_1.__importDefault(require("node:fs"));
const node_path_1 = tslib_1.__importDefault(require("node:path"));
const node_child_process_1 = require("node:child_process");
function packageScripts(script) {
    const filePath = node_path_1.default.join(process.cwd(), "mylang.json");
    if (!node_fs_1.default.existsSync(filePath)) {
        console.error('Error: "mylang.json" not exists.');
        process.exit(1);
    }
    const packageJSON = JSON.parse(node_fs_1.default.readFileSync(filePath).toString());
    if (!packageJSON?.scripts || !packageJSON.scripts[script]) {
        console.error(`Error: missing script: "${script}"`);
        process.exit(1);
    }
    const command = packageJSON.scripts[script];
    console.log();
    console.log(`> ${script}`);
    console.log(`> ${command}`);
    try {
        (0, node_child_process_1.execSync)(command, { stdio: "inherit" });
    }
    catch (err) {
        console.log();
        console.error(err);
        console.log();
        console.error(`> Script "${script}" failed.`);
        process.exit(1);
    }
}
