#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { Command } from "commander";
import chokidar from "chokidar";
import { packageInt } from "./package/init";
import { packageScripts } from "./package/runScripts";
import { replMyLang } from "./package/replMyLang";
import { installPackage } from "./package/install";
import { uninstallPackage } from "./package/uninstall";
import { showInfo } from "./package/info";
import { run as runFile } from "../src/utils/utils";

const pkg = require("../package.json");

const program = new Command();

program
  .name("mylang")
  .description("CLI for the MyLang programming language")
  .version(pkg.version, "-v, --version", "print MyLang version");

function logError(err: unknown, verbose: boolean) {
  if (verbose && err instanceof Error && err.stack) {
    console.error(err.stack);
  } else {
    console.error(`\x1b[31m${err instanceof Error ? err.message : err}\x1b[0m`);
  }
}

/** Runs a single execution pass of the given file, reporting success/failure. */
function executeFile(file: string, options: Record<string, any>) {
  runFile(fs.readFileSync(file).toString(), {
    base: path.join(process.cwd(), path.parse(file).dir),
    main: path.join(process.cwd(), file),
    options,
  });
}

/**
 * Shared implementation for both `mylang <file>` and `mylang run <target>`.
 * Handles optional --watch and consistent error reporting.
 */
function runTarget(file: string, options: Record<string, any>) {
  if (options.watch !== undefined && options.watch !== false) {
    const watchPath =
      typeof options.watch === "string" && options.watch.length > 0 ? options.watch : file;
    const delay = parseInt(options.delay, 10);
    let timeout: NodeJS.Timeout | null = null;

    console.info(`\x1b[32mWatching '${watchPath}' (delay ${delay}ms)...\x1b[0m`);

    const runOnce = () => {
      console.clear();
      console.log(`\x1b[32mRunning '${file}'\x1b[0m`);
      try {
        executeFile(file, options);
        console.info(`\x1b[36mDone.\x1b[0m`);
      } catch (err) {
        logError(err, options.verbose);
      }
    };

    runOnce();

    chokidar.watch(watchPath).on("change", () => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(runOnce, delay);
    });
    return;
  }

  try {
    executeFile(file, options);
  } catch (err) {
    logError(err, options.verbose);
    process.exitCode = 1;
  }
}

program
  .argument("[file]", "MyLang file to run (shorthand for `mylang run <file>`)")
  .option(
    "--watch [path]",
    "re-run on file changes (watches the file itself unless a path is given)",
  )
  .option("--delay <ms>", "debounce delay in ms before re-running", "1000")
  .option("--no-cache", "disable execution cache")
  .option("--verbose", "print full error stacks")
  .action((file, options) => {
    if (!file) {
      program.help();
      return;
    }
    runTarget(file, options);
  });

program
  .command("run")
  .description("run a .ml file, or a named script from mylang.json")
  .argument("[target]", "file path or script name (omit to list scripts)")
  .argument("[args...]", "arguments passed to the script (use -- before them)")
  .option(
    "--watch [path]",
    "re-run on file changes (watches the file itself unless a path is given)",
  )
  .option("--delay <ms>", "debounce delay in ms before re-running", "1000")
  .option("--no-cache", "disable execution cache")
  .option("--verbose", "print full error stacks")
  .action(async (target, args, options) => {
    try {
      if (target && fs.existsSync(target) && fs.statSync(target).isFile()) {
        runTarget(target, options);
        return;
      }
      await packageScripts(target, args);
    } catch (err) {
      logError(err, options.verbose);
      process.exitCode = process.exitCode || 1;
    }
  });

program
  .command("init")
  .description("initialize a new MyLang project")
  .option("-y, --yes", "accept default settings")
  .action((options) => {
    try {
      packageInt(options);
    } catch (err) {
      logError(err, options.verbose);
      process.exitCode = 1;
    }
  });

program
  .command("repl")
  .description("start an interactive MyLang REPL")
  .action(() => {
    try {
      replMyLang();
    } catch (err) {
      logError(err, false);
      process.exitCode = 1;
    }
  });

program
  .command("install")
  .alias("i")
  .description("install a package (omit name to install all dependencies)")
  .argument("[pkg]", "package name")
  .action(async (pkgName, options) => {
    try {
      await installPackage(pkgName);
    } catch (err) {
      logError(err, options.verbose);
      process.exitCode = 1;
    }
  });

program
  .command("uninstall")
  .aliases(["remove", "rm"])
  .description("remove an installed package")
  .argument("<pkg>", "package (owner:repo or repo)")
  .option("--verbose", "print full error stacks")
  .action(async (pkgName, options) => {
    try {
      await uninstallPackage(pkgName);
    } catch (err) {
      logError(err, options.verbose);
      process.exitCode = 1;
    }
  });

program
  .command("info")
  .description("show info about the current project (from mylang.json)")
  .option("--json", "print as JSON")
  .option("--verbose", "print full error stacks")
  .action(async (options) => {
    try {
      await showInfo(pkg.version, options);
    } catch (err) {
      logError(err, options.verbose);
      process.exitCode = 1;
    }
  });

const cache = program.command("cache").description("manage the local execution cache");

cache
  .command("clear")
  .description("remove cached execution data")
  .action(() => {
    const cacheDir = path.join(process.cwd(), ".mylang", "cache");
    if (!fs.existsSync(cacheDir)) {
      console.log("Cache is already empty.");
      return;
    }
    fs.rmSync(cacheDir, { recursive: true, force: true });
    console.log(`\x1b[36mCache cleared (${cacheDir})\x1b[0m`);
  });

program
  .command("version")
  .description("print MyLang version")
  .action(() => console.log(pkg.version));

program.parse(process.argv);
