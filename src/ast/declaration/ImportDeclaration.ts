import fetch from "node-fetch";
import { readFile, access, constants } from "node:fs/promises";
import { join as joinPath, parse as parsePath } from "node:path";
import { StmtType } from "../StmtType";
import { type Position } from "../../lexer/token/Position";
import { Bytes } from "../../../library/bytes/Bytes";
import { Environment } from "../../Environment";
import {
  FileReadFaildError,
  FileReadFaildCodeError,
} from "../../errors/runtime/FileReadFaildError";
import { ImportFaildError, ImportFaildCodeError } from "../../errors/runtime/ImportFaildError";
import { run as runFile } from "../../utils/utils";

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

const buildInModule = [
  "coreio",
  "syncbox",
  "strings",
  "arrays",
  "objects",
  "random",
  "path",
  "os",
  "os/system",
  "uuid",
  "iter",
  "collections",
  "net/http",
  "net/url",
  "utils/colors",
  "bytes",
  "fs",
  "fs/stream",
  "events",
  "runtime",
  "time",
  "numbers",
  "numbers/bigint",
  "utils",
  "json",
];

class ImportDeclaration extends StmtType {
  public readonly position: Position;
  public readonly expression: boolean;
  public readonly destructuring: string[] | null;
  public readonly aliases: string | null;
  public readonly package: string | Record<string, StmtType>;

  constructor(
    packageName: string | Record<string, StmtType>,
    destructuring: string[] | null,
    aliases: string | null,
    expression: boolean,
    position: Position,
  ) {
    super();

    this.package = packageName;

    this.destructuring = destructuring;

    this.aliases = aliases;

    this.expression = expression;

    this.position = position;
  }

  async resolveJSONModule(source: string, score: Environment) {
    const fullPath = joinPath(score.get("import").base, source);

    if (score.get("import").cache[fullPath] && !score.get("#options").disableCache)
      return score.get("import").cache[fullPath];

    try {
      const json = JSON.parse((await readFile(fullPath, "utf8")).toString());

      score.update("import", {
        ...score.get("import"),
        ...(!score.get("#options").disableCache && {
          cache: {
            ...score.get("import").cache,
            [fullPath]: json,
          },
        }),
        paths: Array.from(new Set([score.get("import").main, ...score.get("import").paths])),
      });

      return json;
    } catch (err) {
      throw new FileReadFaildError(FileReadFaildCodeError.JSONReadFaild, {
        err: String(err).split(":").slice(1).join("").trim().toLowerCase(),
        fullPath,
        files: score.get("import").paths,
      });
    }
  }

  async resolveHTTPModule(url: string, score: Environment) {
    if (score.get("import").cache[url] && !score.get("#options").disableCache) {
      return score.get("import").cache[url];
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new ImportFaildError(ImportFaildCodeError.ImportHttpFaild, {
        statusCode: response.status,
        cause: {
          url,
          statusCode: response.status,
          statusText: response.statusText,
        },
        files: score.get("import").paths,
      });
    }

    const responseData = response.body.toString();

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
          paths: Array.from(new Set([score.get("import").main, ...score.get("import").paths])),
        });

        return json;
      } catch (err) {
        throw new ImportFaildError(ImportFaildCodeError.ImportHttpJsonFaild, {
          err: String(err),
          cause: {
            url,
            statusCode: response.status,
            statusText: response.statusText,
          },
          files: score.get("import").paths,
        });
      }
    } else {
      try {
        const context = await runFile(responseData, {
          base: score.get("import").base,
          main: url,
          ...(!score.get("#options").disableCache && {
            cache: {
              ...score.get("import").cache,
              [url]: score.get("#exports"),
            },
          }),
          paths: Array.from(new Set([score.get("import").main, ...score.get("import").paths])),
          options: score.get("#options"),
        });

        const expModule: Record<string, any> = {};
        const contextExports = context.interpreter.globalScore.get("#exports");

        for (const key in contextExports) {
          if (contextExports[key]?.[Environment.SymbolExports]) {
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
        throw new ImportFaildError(ImportFaildCodeError.ImportHttpFileFaild, {
          err: "message" in err ? err.message : String(err),
          cause: {
            url,
            statusCode: response.status,
            statusText: response.statusText,
          },
          files: score.get("import").paths,
        });
      }
    }
  }

  async resolveBuildInModule(source: string, score: Environment) {
    if (score.get("import").cache[source] && !score.get("#options").disableCache)
      return score.get("import").cache[source];

    const { default: resolvePackage } = await import(`../../../library/${source}/index.js`);

    score.update("import", {
      ...score.get("import"),
      ...(!score.get("#options").disableCache && {
        cache: {
          ...score.get("import").cache,
          [source]: resolvePackage,
        },
      }),
      paths: Array.from(new Set([score.get("import").main, ...score.get("import").paths])),
    });

    return resolvePackage;
  }

  async resolveFileModule(source: string, score: Environment) {
    const fullPath = joinPath(score.get("import").base, source);

    if (score.get("import").cache[fullPath] && !score.get("#options").disableCache)
      return score.get("import").cache[fullPath];

    if (!(await fileExists(fullPath))) {
      throw new ImportFaildError(ImportFaildCodeError.ImportNoSuchFile, {
        fullPath,
        cause: {
          fullPath,
        },
        files: score.get("import").paths,
      });
    }

    if (fullPath.endsWith(".js")) {
      const { default: context } = await import(fullPath);

      score.update("import", {
        ...score.get("import"),
        ...(!score.get("#options").disableCache && {
          cache: {
            ...score.get("import").cache,
            [fullPath]: context,
          },
        }),
        paths: Array.from(new Set([score.get("import").main, ...score.get("import").paths])),
      });

      return context;
    }

    try {
      const content = (await readFile(fullPath, "utf8")).toString();

      const context = await runFile(content, {
        base: parsePath(fullPath).dir,
        main: fullPath,
        ...(!score.get("#options").disableCache && {
          cache: {
            ...score.get("import").cache,
            [fullPath]: score.get("#exports"),
          },
        }),
        paths: Array.from(new Set([score.get("import").main, ...score.get("import").paths])),
        options: score.get("#options"),
      });

      const expModule: Record<string, any> = {};
      const contextExports = context.interpreter.globalScore.get("#exports");

      for (const key in contextExports) {
        if (contextExports[key]?.[Environment.SymbolExports]) {
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
        paths: Array.from(new Set([score.get("import").main, ...score.get("import").paths])),
      });

      return context.interpreter.globalScore.get("#exports");
    } catch (err: any) {
      throw new ImportFaildError(ImportFaildCodeError.ImportFileRunFaild, {
        err: "message" in err ? err.message : String(err),
        cause: {
          fullPath,
        },
        files: score.get("import").paths,
      });
    }
  }

  async resolvePackageModule(source: string, score: Environment) {
    if (score.get("import").cache[source] && !score.get("#options").disableCache)
      return score.get("import").cache[source];

    const myLangJSON = JSON.parse(
      (await readFile(joinPath(score.get("import").base, "mylang.json"))).toString(),
    );

    const dependenciesSource = myLangJSON.dependencies[source.split(":")[1]!];

    if (!dependenciesSource) {
      throw new ImportFaildError(ImportFaildCodeError.ImportSourceModuleFaild, {
        source,
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

    if (!(await fileExists(runFileSource))) {
      throw new ImportFaildError(ImportFaildCodeError.ImportMainNotFound, {
        file: runFileSource,
        cause: {
          fullPath: runFileSource,
        },
        files: score.get("import").paths,
      });
    }

    const runLibSource = joinPath(score.get("import").base, ".module", source);
    const context = await runFile((await readFile(runFileSource)).toString(), {
      base: joinPath(score.get("import").base, ".module", source.replace(":", "/")),
      main: runLibSource,
      ...(!score.get("#options").disableCache && {
        cache: {
          ...score.get("import").cache,
          [source]: score.get("#exports"),
        },
      }),
      paths: Array.from(new Set([score.get("import").main, ...score.get("import").paths])),
      options: score.get("#options"),
    });

    const expModule: Record<string, any> = {};
    const contextExports = context.interpreter.globalScore.get("#exports");

    for (const key in contextExports) {
      if (contextExports[key]?.[Environment.SymbolExports]) {
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

  async handleModuleImport(module: any, name: string, score: Environment) {
    if (this.expression) return module;

    if (!score.get("#options").disableCache) {
      if (this.destructuring) {
        for (const key of this.destructuring) {
          if (!(key in module)) {
            throw new ImportFaildError(ImportFaildCodeError.ImportDestructuringFaild, {
              key,
              cause: {
                key,
              },
              files: score.get("import").paths,
            });
          }

          if (module[key]?.[Environment.SymbolExports]) {
            score.create(key, module[key].value, module[key].optionsVar);
          } else score.create(key, module[key]);
        }
      } else {
        const expModule: Record<string, any> = {};

        for (const key in module) {
          if (module[key]?.[Environment.SymbolExports]) {
            expModule[key] = module[key].value;
          } else expModule[key] = module[key];
        }

        score.create(name, expModule);

        return expModule;
      }
    }
  }

  async evaluateSinglePackage(packageName: string, score: Environment) {
    const { ext, dir, base, name } = parsePath(packageName);
    const fullPath = joinPath(dir, base);

    if (packageName.startsWith("http://") || packageName.startsWith("https://")) {
      return this.handleModuleImport(
        await this.resolveHTTPModule(packageName, score),
        this.aliases || name,
        score,
      );
    }

    if (ext === ".json") {
      return this.handleModuleImport(
        await this.resolveJSONModule(fullPath, score),
        this.aliases || name,
        score,
      );
    }

    if (ext === "" && buildInModule.includes(packageName)) {
      return this.handleModuleImport(
        await this.resolveBuildInModule(fullPath, score),
        this.aliases || (packageName.includes("/") ? packageName.split("/")[1]! : packageName),
        score,
      );
    }

    if (ext === ".ml" || ext === ".js") {
      return this.handleModuleImport(
        await this.resolveFileModule(fullPath, score),
        this.aliases || name,
        score,
      );
    }

    if (packageName.split(":")[1]) {
      return this.handleModuleImport(
        await this.resolvePackageModule(packageName, score),
        this.aliases || packageName.split(":")[1]!,
        score,
      );
    }

    if (await fileExists(fullPath)) {
      return this.handleModuleImport(
        new Bytes([(await readFile(fullPath)).toString()], [], score).call(),
        this.aliases || name,
        score,
      );
    }

    throw new ImportFaildError(ImportFaildCodeError.ImportFindModuleFaild, {
      name: packageName,
      cause: {
        packageName: name,
      },
      files: score.get("import").paths,
    });
  }

  async evaluateMultiplePackages(score: Environment) {
    const packages: Record<string, any> = {};

    for (const [packageName, packageStmt] of Object.entries(this.package)) {
      const resolvePath =
        packageStmt instanceof StmtType ? await packageStmt.evaluate(score) : packageStmt;
      const { ext, name } = parsePath(resolvePath);

      if (resolvePath.startsWith("http://") || resolvePath.startsWith("https://")) {
        packages[packageName] = await this.resolveHTTPModule(resolvePath, score);
      } else if (ext === ".json") {
        packages[packageName] = await this.resolveJSONModule(resolvePath, score);
      } else if (buildInModule.includes(packageName)) {
        if (packageName.includes("/")) {
          packages[packageName] = await this.resolveBuildInModule(packageName, score);
        } else {
          packages[packageName] = await this.resolveBuildInModule(name, score);
        }
      } else if (buildInModule.includes(resolvePath)) {
        if (resolvePath.includes("/")) {
          packages[name] = await this.resolveBuildInModule(resolvePath, score);
        } else {
          packages[packageName] = await this.resolveBuildInModule(name, score);
        }
      } else if (ext === ".ml" || ext === ".js") {
        if (packageName !== name) {
          packages[packageName] = await this.resolveFileModule(resolvePath, score);
        } else {
          packages[name] = await this.resolveFileModule(resolvePath, score);
        }
      } else if (await fileExists(resolvePath)) {
        packages[name] = new Bytes([(await readFile(resolvePath)).toString()], [], score).call();
      } else {
        throw new ImportFaildError(ImportFaildCodeError.ImportFindBildInModuleFaild, {
          name: packageName,
          cause: {
            packageName,
          },
          files: score.get("import").paths,
        });
      }

      if (ext === ".ml" || ext === ".js") {
        if (parsePath(packageName).ext) {
          score.create(name, packages[packageName]);
        } else if (packageName !== name) {
          score.create(packageName, packages[packageName]);
        } else {
          score.create(name, packages[name]);
        }
      } else if (packageName.includes("/")) {
        const variableName = packageName.split("/").at(-1)!;
        score.create(variableName, packages[packageName]);
      } else {
        if (packages[packageName]) {
          score.create(packageName, packages[packageName]);
        } else {
          score.create(packageName, packages[name]);
        }
      }
    }

    return this.expression ? packages : null;
  }

  async evaluate(score: Environment) {
    if (typeof this.package === "string") {
      return this.evaluateSinglePackage(this.package, score);
    } else {
      return this.evaluateMultiplePackages(score);
    }
  }
}

export { ImportDeclaration };
