import { readFileSync } from "node:fs";
import { join as joinPath, parse as parsePath } from "node:path";
import { Stmt } from "../Stmt";
import type { StmtType } from "../StmtType";
import type { Position } from "../../lexer/Token";

class ImportDeclaration extends Stmt {
  public readonly package: string | Record<string, StmtType>;
  public readonly position: Position;
  public readonly buildInLibs = ["process", "math", "strings"];
  public readonly expression: boolean;

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

  resolveJSONModule(source: string, score: Record<string, any>) {
    const resolve = joinPath(score.import.base, source);
    if (score.import.cache?.[resolve]) return score.import.cache[resolve];

    try {
      const json = JSON.parse(readFileSync(resolve, "utf8"));
      score.import.cache[resolve] = json;
      return json;
    } catch (err) {
      throw new Error(`Failed to load JSON module: ${err}`);
    }
  }

  resolvePackageModule(source: string, score: Record<string, any>) {
    if (score.import.cache?.[source]) return score.import.cache[source];

    const resolvePackage = require(`../../native/lib/${source}/index`);
    score.import.cache[source] = resolvePackage;
    return resolvePackage;
  }

  handleModuleImport(module: any, name: string, score: Record<string, any>) {
    if (this.expression) return module;
    score[name] = module;
  }

  evaluateSinglePackage(packageName: string, score: Record<string, any>) {
    const { ext, base, name } = parsePath(packageName);

    if (ext === ".json") {
      return this.handleModuleImport(
        this.resolveJSONModule(base, score),
        name,
        score,
      );
    }

    if (ext === "" && this.buildInLibs.includes(name)) {
      return this.handleModuleImport(
        this.resolvePackageModule(base, score),
        name,
        score,
      );
    }

    throw new Error(`Cannot find module: "${name}"`);
  }

  evaluateMultiplePackages(score: Record<string, any>) {
    const packages: Record<string, any> = {};

    for (const [packageName, packageStmt] of Object.entries(this.package)) {
      const { ext, base, name } = parsePath(packageStmt.evaluate(score));

      if (ext === ".json") {
        packages[packageName] = this.resolveJSONModule(base, score);
      } else if (this.buildInLibs.includes(name)) {
        packages[packageName] = this.resolvePackageModule(base, score);
      } else {
        throw new Error(`No such built-in module: "${packageName}"`);
      }

      score[packageName] = packages[packageName];
    }

    return this.expression ? packages : null;
  }

  override evaluate(score: Record<string, any>) {
    if (typeof this.package === "string") {
      return this.evaluateSinglePackage(this.package, score);
    } else {
      return this.evaluateMultiplePackages(score);
    }
  }
}

export { ImportDeclaration };
