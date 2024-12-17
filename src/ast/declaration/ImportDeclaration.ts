import { readFileSync } from "node:fs";
import { join as joinPath, parse as parsePath } from "node:path";
import { StmtType } from "../StmtType";
import { type Position } from "../../lexer/Position";
import { Environment } from "../../Environment";
import { run as runFile } from "../../utils/utils";

class ImportDeclaration extends StmtType {
  public readonly position: Position;
  public readonly expression: boolean;
  public readonly package: string | Record<string, StmtType>;

  constructor(
    packageName: string | Record<string, StmtType>,
    expression: boolean,
    position: Position,
  ) {
    super();
    this.package = packageName;
    this.position = position;
    this.expression = expression;
  }

  get buildInLibs(): string[] {
    return [
      "coreio",
      "strings",
      "numbers",
      "arrays",
      "objects",
      "math",
      "events",
      "ds",
      "time",
      "dotenv",
    ];
  }

  resolveJSONModule(source: string, score: Environment) {
    const fullPath = joinPath(score.get("import").base, source);

    if (score.get("import").cache[fullPath])
      return score.get("import").cache[fullPath];

    try {
      const json = JSON.parse(readFileSync(fullPath, "utf8"));
      score.update("import", {
        ...score.get("import"),
        cache: {
          ...score.get("import").cache,
          [fullPath]: json,
        },
      });
      return json;
    } catch (err) {
      throw `Failed to load JSON module: ${err}`;
    }
  }

  resolveBuildInModule(source: string, score: Environment) {
    if (score.get("import").cache[source])
      return score.get("import").cache[source];

    const resolvePackage = require(`../../native/lib/${source}/index`);
    score.update("import", {
      ...score.get("import"),
      cache: {
        ...score.get("import").cache,
        [source]: resolvePackage,
      },
    });
    return resolvePackage;
  }

  resolveFileModule(source: string, score: Environment) {
    const fullPath = joinPath(score.get("import").base, source);

    if (score.get("import").cache[fullPath])
      return score.get("import").cache[fullPath];

    try {
      const content = readFileSync(fullPath, "utf8").toString();
      const context = runFile(content, {
        base: score.get("import").base,
        main: fullPath,
      });

      score.update("import", {
        ...score.get("import"),
        cache: {
          ...score.get("import").cache,
          [fullPath]: context.globalScore.get("#exports"),
        },
      });
      return context.globalScore.get("#exports");
    } catch (err) {
      throw `Import Invalid: ${err}`;
    }
  }

  handleModuleImport(module: any, name: string, score: Environment) {
    if (this.expression) return module;
    score.create(name, module);
  }

  evaluateSinglePackage(packageName: string, score: Environment) {
    const { ext, dir, base, name } = parsePath(packageName);
    const fullPath = joinPath(dir, base);

    if (ext === ".json") {
      return this.handleModuleImport(
        this.resolveJSONModule(fullPath, score),
        name,
        score,
      );
    }

    if (ext === "" && this.buildInLibs.includes(name)) {
      return this.handleModuleImport(
        this.resolveBuildInModule(fullPath, score),
        name,
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

    throw `Cannot find module: "${name}"`;
  }

  evaluateMultiplePackages(score: Environment) {
    const packages: Record<string, any> = {};

    for (const [packageName, packageStmt] of Object.entries(this.package)) {
      const { ext, base, name } = parsePath(packageStmt.evaluate(score));

      if (ext === ".json") {
        packages[packageName] = this.resolveJSONModule(base, score);
      } else if (this.buildInLibs.includes(name)) {
        packages[packageName] = this.resolveBuildInModule(base, score);
      } else if (ext === ".ml") {
        packages[packageName] = this.resolveFileModule(base, score);
      } else {
        throw `No such built-in module: "${packageName}"`;
      }

      score.create(packageName, packages[packageName]);
    }

    return this.expression ? packages : null;
  }

  override evaluate(score: Environment) {
    if (typeof this.package === "string") {
      return this.evaluateSinglePackage(this.package, score);
    } else {
      return this.evaluateMultiplePackages(score);
    }
  }
}

export { ImportDeclaration };
