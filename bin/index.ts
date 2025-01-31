#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { Command } from "commander";
import chokidar from "chokidar";
import { packageInt } from "./package/init";
import { packageScripts } from "./package/scripts";
import { replMyLang } from "./package/replMyLang";
import { run as runFile } from "../src/utils/utils";

const program = new Command();

program.name("mylang").description("CLI for mylang").version("0.1.0");

program
  .command("version")
  .description("version MyLang")
  .action(() => console.log(require("../package.json").version));

program
  .argument("<file>", "file to run")
  .option("--watch <file>", "watch the file and rerun on changes")
  .option("--delay <ms>", "delay before rerunning (default: 1000ms)", "1000")
  .action((file, options) => {
    if (options.watch) {
      let timeout: NodeJS.Timeout | null = null;
      const delay = parseInt(options.delay || 1000, 10);

      console.info(
        `\x1b[32mWatching '${file}' with delay ${delay}ms...\x1b[0m`,
      );

      chokidar
        .watch(options.watch?.startsWith("--") ? "./" : options.watch)
        .on("change", () => {
          if (timeout) clearTimeout(timeout);
          timeout = setTimeout(() => {
            console.clear();
            console.log(`\x1b[32mRestarting '${file}'\x1b[0m`);

            try {
              runFile(fs.readFileSync(file).toString(), {
                base: process.cwd(),
                main: path.join(process.cwd(), file),
                options,
              });
              console.info(`\x1b[36mCompleted running '${file}'\x1b[0m`);
            } catch (err) {
              console.error(`${err}\n`);
              console.log(`\x1b[31mFailed running '${file}'\x1b[0m`);
            }
          }, delay);
        });
    } else {
      runFile(fs.readFileSync(file).toString(), {
        base: process.cwd(),
        main: path.join(process.cwd(), file),
        options,
      });
    }
  });

program
  .command("init")
  .description("initialize project")
  .option("-y, --yes", "default settings")
  .action((options) => packageInt(options));

program
  .command("run")
  .description("run the script named")
  .argument("<script>", "script named")
  .action((script) => packageScripts(script));

program
  .command("repl")
  .description("start a custom REPL session")
  .action(() => replMyLang());

// program
//   .command("install")
//   .description("install a specific package")
//   .argument("<pkg>", "package to install")
//   .option("--git", "force git installation")
//   .option("--branch <char>", "force git a specific branch install")
//   .option("--npm", "force npm installation")
//   .action((pkg, options) => packageInstall(pkg, options));

program.parse(process.argv);
