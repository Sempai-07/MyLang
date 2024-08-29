import { Stmt } from "../Stmt";
import type { StmtType } from "../StmtType";
import type { Position } from "../../lexer/Token";

class CallExpression extends Stmt {
  public readonly identifier: string;
  public readonly method: string;
  public readonly argument: StmtType[];
  public readonly position: Position;

  constructor(
    identifier: string,
    method: string,
    argument: StmtType[],
    position: Position,
  ) {
    super();

    this.identifier = identifier;
    
    this.method = method;
    
    this.argument = argument;

    this.position = position;
  }

  override evaluate(score: Record<string, any>) {
    if (!(this.identifier in score) || !score[this.identifier][this.method]) {
      throw new Error(`Invalid identity ${this.identifier}`);
    }
    
    return score[this.identifier][this.method](this.argument);
  }
}

export { CallExpression };
