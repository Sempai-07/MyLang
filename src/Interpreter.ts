import fs from "node:fs";
import path from "node:path";
import { type StmtType } from "./ast/StmtType";
import { Position } from "./lexer/token/Position";
import { FileReadFaildError, FileReadFaildCodeError } from "./errors/runtime/FileReadFaildError";
import { BaseError } from "./errors/BaseError";
import { BlockStatement } from "./ast/statement/BlockStatement";
import { Environment } from "./Environment";
import { runtime } from "./runtime/Runtime";

// @ts-ignore
import process from "../library/os/system/index";
import {
  resolve as resolveNativeFunc,
  asImport as asImportNativeFunc,
} from "./native/function/import";
import {
  allWait as waitAllNativeFunc,
  raceWait as raceAllNativeFunc,
  allSettledWait as allSettledNativeFunc,
  anyWait as anyWaitNativeFunc,
} from "./native/function/wait";
import { Length as LengthNativeFunc } from "./native/function/global";

class Interpreter {
  public readonly ast: StmtType[];
  public readonly globalScore: Environment;

  constructor(ast: StmtType[], paths: string[], options: Record<string, any>) {
    this.ast = ast;

    const globalScore = new Environment();

    this.globalScore = globalScore;

    this.globalScore.create("import", {
      base: options.base,
      main: options.main,
      cache: options.cache || {},
      paths,
      resolve: resolveNativeFunc,
      as: asImportNativeFunc,
    });

    this.globalScore.create("wait", {
      all: waitAllNativeFunc,
      race: raceAllNativeFunc,
      allSettled: allSettledNativeFunc,
      any: anyWaitNativeFunc,
    });

    this.globalScore.create("length", LengthNativeFunc);

    this.globalScore.create("process", process);

    const fullPathJSON = path.join(options.base, "mylang.json");

    if (fs.existsSync(fullPathJSON)) {
      try {
        const myLangJSON = JSON.parse(fs.readFileSync(fullPathJSON).toString());

        this.globalScore.update("import", {
          ...this.globalScore.get("import"),
          myLangJSON,
        });

        if (myLangJSON.initScript) {
          const initFileScript = path.join(options.base, myLangJSON.initScript);

          if (!fs.existsSync(initFileScript)) {
            throw new FileReadFaildError(FileReadFaildCodeError.NotFountInitFileScript, {
              fullPath: initFileScript,
              files: [options.base],
            });
          }

          this.addCustomFunction(initFileScript);
        }
      } catch (err) {
        throw new FileReadFaildError(FileReadFaildCodeError.FaildInitFileScript, {
          err: String(err),
          files: [options.base],
        });
      }
    }

    this.globalScore.create("#exports", {});

    this.globalScore.create("#options", options.options);
  }

  async run() {
    const blockStmt = new BlockStatement(this.ast, new Position(0, 0));

    await blockStmt.evaluate(this.globalScore);

    return runtime.getLastExecutionResult();
  }

  addCustomFunction(fileInit: string) {
    try {
      const initialize = require(fileInit).init;

      for (const name in initialize) {
        try {
          this.globalScore.create(name, initialize[name]);
        } catch {
          throw new BaseError(`Invalid added "${name}"`);
        }
      }
    } catch (err) {
      throw new FileReadFaildError(FileReadFaildCodeError.FaildInitFileScript, {
        err: String(err),
        files: [fileInit],
      });
    }
  }
}

export { Interpreter };
