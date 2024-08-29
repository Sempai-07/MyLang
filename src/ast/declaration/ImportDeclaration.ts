import { Stmt } from "../Stmt";
import type { StmtType } from "../StmtType";
import type { Position } from "../../lexer/Token";

class ImportDeclaration extends Stmt {
  public readonly package: StmtType;
  public readonly position: Position;
  public readonly buildInLibs: string[];
  public readonly expression: boolean;
  
  constructor(packageName: StmtType, expression: boolean,  position: Position) {
    super();

    this.package = packageName;

    this.position = position;
    
    this.expression = expression;
    
    this.buildInLibs = ["coreio"];
  }

  override evaluate(score: Record<string, any>) {
    const packageName = this.package.evaluate(score);
    
    if (!this.buildInLibs.includes(packageName)) {
      throw new Error(`No such built-in module: "${packageName}"`)
    }
    
    if (this.expression) {
      return require(`../../native/lib/${packageName}/index`);
    } else {
      score[packageName] = require(`../../native/lib/${packageName}/index`);
    }
  }
}

export { ImportDeclaration };
