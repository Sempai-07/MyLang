#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const node_fs_1 = tslib_1.__importDefault(require("node:fs"));
const node_path_1 = tslib_1.__importDefault(require("node:path"));
const commander_1 = require("commander");
const chokidar_1 = tslib_1.__importDefault(require("chokidar"));
const init_1 = require("./package/init");
const scripts_1 = require("./package/scripts");
const replMyLang_1 = require("./package/replMyLang");
const install_1 = require("./package/install");
const utils_1 = require("../src/utils/utils");
const program = new commander_1.Command();
program
    .name("mylang")
    .description("CLI for mylang")
    .version(require("../../package.json").version);
program
    .command("version")
    .description("version MyLang")
    .action(() => console.log(require("../../package.json").version));
program
    .argument("<file>", "file to run")
    .option("--watch <file>", "watch the file and rerun on changes")
    .option("--delay <ms>", "delay before rerunning (default: 1000ms)", "1000")
    .action((file, options) => {
    if (options.watch) {
        let timeout = null;
        const delay = parseInt(options.delay, 10);
        console.info(`\x1b[32mWatching '${file}' with delay ${delay}ms...\x1b[0m`);
        chokidar_1.default
            .watch(options.watch?.startsWith("--") ? "./" : options.watch)
            .on("change", () => {
            if (timeout)
                clearTimeout(timeout);
            timeout = setTimeout(() => {
                console.clear();
                console.log(`\x1b[32mRestarting '${file}'\x1b[0m`);
                try {
                    (0, utils_1.run)(node_fs_1.default.readFileSync(file).toString(), {
                        base: process.cwd(),
                        main: node_path_1.default.join(process.cwd(), file),
                        options,
                    });
                    console.info(`\x1b[36mCompleted running '${file}'\x1b[0m`);
                }
                catch (err) {
                    console.error(`${err}\n`);
                    console.log(`\x1b[31mFailed running '${file}'\x1b[0m`);
                }
            }, delay);
        });
    }
    else {
        try {
            (0, utils_1.run)(node_fs_1.default.readFileSync(file).toString(), {
                base: process.cwd(),
                main: node_path_1.default.join(process.cwd(), file),
                options,
            });
        }
        catch (err) {
            console.error(`${err}`);
        }
    }
});
program
    .command("init")
    .description("initialize project")
    .option("-y, --yes", "default settings")
    .action((options) => (0, init_1.packageInt)(options));
program
    .command("run")
    .description("run the script named")
    .argument("<script>", "script named")
    .action((script) => (0, scripts_1.packageScripts)(script));
program
    .command("repl")
    .description("start a custom REPL session")
    .action(() => (0, replMyLang_1.replMyLang)());
program
    .command("install")
    .description("install a specific package")
    .argument("[pkg]", "package to install")
    .action((pkg) => (0, install_1.installPackage)(pkg));
program.parse(process.argv);
