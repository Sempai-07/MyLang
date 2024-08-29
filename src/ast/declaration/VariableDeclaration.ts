import { Stmt } from "../Stmt";
import type { StmtType } from "../StmtType";
import type { Position } from "../../lexer/Token";

class VariableDeclaration extends Stmt {
  public readonly name: string;
  public readonly value: StmtType;
  public readonly position: Position;

  constructor(name: string, value: StmtType, position: Position) {
    super();

    this.name = name;

    this.value = value;

    this.position = position;
  }

  override evaluate(score: Record<string, any>) {
    score[this.name] = this.value;

    const result = score[this.name]?.evaluate(score);

    if (result) {
      return result;
    }

    return score[this.name];
  }
}

export { VariableDeclaration };
