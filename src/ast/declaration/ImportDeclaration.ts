// @ts-expect-error
import requestSync from "request-sync";
import { readFileSync, existsSync } from "node:fs";
import { join as joinPath, parse as parsePath } from "node:path";
import { StmtType } from "../StmtType";
import { type Position } from "../../lexer/Position";
import { Environment } from "../../Environment";
import { FileReadFaild, ImportFaildError } from "../../errors/BaseError";
import { exportSymbol } from "./ExportsDeclaration";
import { run as runFile } from "../../utils/utils";

class ImportDeclaration extends StmtType {
  public readonly position: Position;
  public readonly expression: boolean;
  public readonly destructuring: string[] | null;
  public readonly package: string | Record<string, StmtType>;

  constructor(
    packageName: string | Record<string, StmtType>,
    destructuring: string[] | null,
    expression: boolean,
    position: Position,
  ) {
    super();

    this.package = packageName;

    this.destructuring = destructuring;

    this.expression = expression;

    this.position = position;
  }

  static get buildInLibs() {
    return [
      "coreio",
      "os",
      "os/exec",
      "fs",
      "buffers",
      "hash",
      "strings",
      "numbers",
      "numbers/bigint",
      "arrays",
      "objects",
      "math",
      "events",
      "timers",
      "promises",
      "ds",
      "time",
      "dotenv",
      "utils",
      "https",
      "json",
      "errors",
      "iter",
      "path",
      "module",
    ];
  }

  resolveJSONModule(source: string, score: Environment) {
    const fullPath = joinPath(score.get("import").base, source);

    if (
      score.get("import").cache[fullPath] &&
      !score.get("#options").disableCache
    )
      return score.get("import").cache[fullPath];

    try {
      const json = JSON.parse(readFileSync(fullPath, "utf8"));

      score.update("import", {
        ...score.get("import"),
        ...(!score.get("#options").disableCache && {
          cache: {
            ...score.get("import").cache,
            [fullPath]: json,
          },
        }),
        paths: Array.from(
          new Set([score.get("import").main, ...score.get("import").paths]),
        ),
      });

      return json;
    } catch (err) {
      throw new FileReadFaild(
        `JSON module: ${String(err)
          .split(":")
          .slice(1)
          .join("")
          .trim()
          .toLowerCase()}`,
        fullPath,
        score.get("import").paths,
      );
    }
  }

  resolveHTTPModule(url: string, score: Environment) {
    if (score.get("import").cache[url] && !score.get("#options").disableCache) {
      return score.get("import").cache[url];
    }

    const options = {
      url,
      method: "GET",
    };

    const res = requestSync(options);

    if (res.statusCode !== 200) {
      throw new ImportFaildError(`HTTP import status: ${res.statusCode}`, {
        code: "IMPORT_HTTP_FAILD",
        cause: {
          url,
          statusCode: res.statusCode,
        },
        files: score.get("import").paths,
      });
    }

    const responseData = res.body.toString("utf8");

    if (responseData.startsWith("Error:")) {
      throw responseData;
    }

    if (parsePath(url).ext === ".json") {
      try {
        const json = JSON.parse(responseData);

        score.update("import", {
          ...score.get("import"),
          ...(!score.get("#options").disableCache && {
            cache: {
              ...score.get("import").cache,
              [url]: json,
            },
          }),
          paths: Array.from(
            new Set([score.get("import").main, ...score.get("import").paths]),
          ),
        });

        return json;
      } catch (err) {
        throw new ImportFaildError(`dynamic load JSON module: ${err}`, {
          code: "IMPORT_HTTP_JSON_FAILD",
          cause: {
            url,
            statusCode: res.statusCode,
          },
          files: score.get("import").paths,
        });
      }
    } else {
      try {
        const context = runFile(responseData, {
          base: score.get("import").base,
          main: url,
          ...(!score.get("#options").disableCache && {
            cache: {
              ...score.get("import").cache,
              [url]: score.get("#exports"),
            },
          }),
          paths: Array.from(
            new Set([score.get("import").main, ...score.get("import").paths]),
          ),
          options: score.get("#options"),
        });

        const expModule: Record<string, any> = {};
        const contextExports = context.interpreter.globalScore.get("#exports");

        for (const key in contextExports) {
          if (contextExports[key]?.[exportSymbol]) {
            expModule[key] = contextExports[key].value;
          } else {
            expModule[key] = contextExports[key];
          }
        }

        score.update("import", {
          ...score.get("import"),
          ...(!score.get("#options").disableCache && {
            cache: {
              ...score.get("import").cache,
              [url]: expModule,
            },
          }),
          paths: Array.from(new Set([url, ...score.get("import").paths])),
        });

        return context.interpreter.globalScore.get("#exports");
      } catch (err: any) {
        throw new ImportFaildError(
          `dynamic load module: ${"message" in err ? err.message : err}`,
          {
            code: "IMPORT_HTTP_FAILD",
            cause: {
              url,
              statusCode: res.statusCode,
            },
            files: score.get("import").paths,
          },
        );
      }
    }
  }

  resolveBuildInModule(source: string, score: Environment) {
    if (
      score.get("import").cache[source] &&
      !score.get("#options").disableCache
    )
      return score.get("import").cache[source];

    const resolvePackage = require(`../../native/lib/${source}/index`);

    score.update("import", {
      ...score.get("import"),
      ...(!score.get("#options").disableCache && {
        cache: {
          ...score.get("import").cache,
          [source]: resolvePackage,
        },
      }),
      paths: Array.from(
        new Set([score.get("import").main, ...score.get("import").paths]),
      ),
    });

    return resolvePackage;
  }

  resolveFileModule(source: string, score: Environment) {
    const fullPath = joinPath(score.get("import").base, source);

    if (
      score.get("import").cache[fullPath] &&
      !score.get("#options").disableCache
    )
      return score.get("import").cache[fullPath];

    if (!existsSync(fullPath)) {
      throw new ImportFaildError(`no such file: ${fullPath}`, {
        code: "IMPORT_FILE_FAILD",
        cause: {
          fullPath,
        },
        files: score.get("import").paths,
      });
    }

    try {
      const content = readFileSync(fullPath, "utf8").toString();

      const context = runFile(content, {
        base: score.get("import").base,
        main: fullPath,
        ...(!score.get("#options").disableCache && {
          cache: {
            ...score.get("import").cache,
            [fullPath]: score.get("#exports"),
          },
        }),
        paths: Array.from(
          new Set([score.get("import").main, ...score.get("import").paths]),
        ),
        options: score.get("#options"),
      });

      const expModule: Record<string, any> = {};
      const contextExports = context.interpreter.globalScore.get("#exports");

      for (const key in contextExports) {
        if (contextExports[key]?.[exportSymbol]) {
          expModule[key] = contextExports[key].value;
        } else {
          expModule[key] = contextExports[key];
        }
      }

      score.update("import", {
        ...score.get("import"),
        ...(!score.get("#options").disableCache && {
          cache: {
            ...score.get("import").cache,
            [fullPath]: expModule,
          },
        }),
        paths: Array.from(
          new Set([score.get("import").main, ...score.get("import").paths]),
        ),
      });

      return context.interpreter.globalScore.get("#exports");
    } catch (err: any) {
      throw new ImportFaildError(`${"message" in err ? err.message : err}`, {
        code: "IMPORT_FILE_RUN_FAILD",
        cause: {
          fullPath,
        },
        files: score.get("import").paths,
      });
    }
  }

  resolvePackageModule(source: string, score: Environment) {
    if (
      score.get("import").cache[source] &&
      !score.get("#options").disableCache
    )
      return score.get("import").cache[source];

    const myLangJSON = JSON.parse(
      readFileSync(
        joinPath(score.get("import").base, "mylang.json"),
      ).toString(),
    );

    const dependenciesSource = myLangJSON.dependencies[source.split(":")[1]!];

    if (!dependenciesSource) {
      throw new ImportFaildError(`No resolve module: "${source}"`, {
        code: "IMPORT_MODULE_FAILD",
        cause: {
          packageName: source,
        },
        files: score.get("import").paths,
      });
    }

    const runFileSource = joinPath(
      score.get("import").base,
      ".module",
      source.replace(":", "/"),
      myLangJSON.main,
    );

    if (!existsSync(runFileSource)) {
      throw new ImportFaildError(`File main "${runFileSource}" not found`, {
        code: "IMPORT_FILE_RUN_FAILD",
        cause: {
          fullPath: runFileSource,
        },
        files: score.get("import").paths,
      });
    }

    const runLibSource = joinPath(score.get("import").base, ".module", source);
    const context = runFile(readFileSync(runFileSource).toString(), {
      base: joinPath(
        score.get("import").base,
        ".module",
        source.replace(":", "/"),
      ),
      main: runLibSource,
      ...(!score.get("#options").disableCache && {
        cache: {
          ...score.get("import").cache,
          [source]: score.get("#exports"),
        },
      }),
      paths: Array.from(
        new Set([score.get("import").main, ...score.get("import").paths]),
      ),
      options: score.get("#options"),
    });

    const expModule: Record<string, any> = {};
    const contextExports = context.interpreter.globalScore.get("#exports");

    for (const key in contextExports) {
      if (contextExports[key]?.[exportSymbol]) {
        expModule[key] = contextExports[key].value;
      } else {
        expModule[key] = contextExports[key];
      }
    }

    score.update("import", {
      ...score.get("import"),
      ...(!score.get("#options").disableCache && {
        cache: {
          ...score.get("import").cache,
          [source]: expModule,
        },
      }),
      paths: Array.from(new Set([source, ...score.get("import").paths])),
    });

    return context.interpreter.globalScore.get("#exports");
  }

  handleModuleImport(module: any, name: string, score: Environment) {
    if (this.expression) return module;
    if (!score.get("#options").disableCache) {
      if (this.destructuring) {
        for (const key of this.destructuring) {
          if (!(key in module)) {
            throw new ImportFaildError(
              `The key '${key}' is not in the object.`,
              {
                code: "IMPORT_DESTRUCTURING_FAILD",
                cause: {
                  key,
                },
                files: score.get("import").paths,
              },
            );
          }
          if (module[key]?.[exportSymbol]) {
            score.create(key, module[key].value, module[key].optionsVar);
          } else score.create(key, module[key]);
        }
      } else {
        const expModule: Record<string, any> = {};

        for (const key in module) {
          if (module[key]?.[exportSymbol]) {
            expModule[key] = module[key].value;
          } else expModule[key] = module[key];
        }

        score.create(name, expModule);

        return expModule;
      }
    }
  }

  evaluateSinglePackage(packageName: string, score: Environment) {
    const { ext, dir, base, name } = parsePath(packageName);
    const fullPath = joinPath(dir, base);

    if (
      packageName.startsWith("http://") ||
      packageName.startsWith("https://")
    ) {
      return this.handleModuleImport(
        this.resolveHTTPModule(packageName, score),
        name,
        score,
      );
    }

    if (ext === ".json") {
      return this.handleModuleImport(
        this.resolveJSONModule(fullPath, score),
        name,
        score,
      );
    }

    if (ext === "" && ImportDeclaration.buildInLibs.includes(packageName)) {
      return this.handleModuleImport(
        this.resolveBuildInModule(fullPath, score),
        packageName.includes("/") ? packageName.split("/")[1]! : packageName,
        score,
      );
    }

    if (ext === ".ml") {
      return this.handleModuleImport(
        this.resolveFileModule(fullPath, score),
        name,
        score,
      );
    }

    if (packageName.split(":")[1]) {
      return this.handleModuleImport(
        this.resolvePackageModule(packageName, score),
        packageName.split(":")[1]!,
        score,
      );
    }

    throw new ImportFaildError(`Cannot find module: "${name}"`, {
      code: "IMPORT_MODULE_FAILD",
      cause: {
        packageName: name,
      },
      files: score.get("import").paths,
    });
  }

  evaluateMultiplePackages(score: Environment) {
    const packages: Record<string, any> = {};

    for (const [packageName, packageStmt] of Object.entries(this.package)) {
      const resolvePath =
        packageStmt instanceof StmtType
          ? packageStmt.evaluate(score)
          : packageStmt;
      const { ext, base, name } = parsePath(resolvePath);

      if (
        resolvePath.startsWith("http://") ||
        resolvePath.startsWith("https://")
      ) {
        packages[packageName] = this.resolveHTTPModule(resolvePath, score);
      } else if (ext === ".json") {
        packages[packageName] = this.resolveJSONModule(base, score);
      } else if (ImportDeclaration.buildInLibs.includes(name)) {
        packages[packageName] = this.resolveBuildInModule(base, score);
      } else if (ext === ".ml") {
        packages[packageName] = this.resolveFileModule(base, score);
      } else {
        throw new ImportFaildError(
          `No such built-in module: "${packageName}"`,
          {
            code: "IMPORT_MODULE_FAILD",
            cause: {
              packageName,
            },
            files: score.get("import").paths,
          },
        );
      }

      score.create(packageName, packages[packageName]);
    }

    return this.expression ? packages : null;
  }

  evaluate(score: Environment) {
    if (typeof this.package === "string") {
      return this.evaluateSinglePackage(this.package, score);
    } else {
      return this.evaluateMultiplePackages(score);
    }
  }
}

export { ImportDeclaration };
