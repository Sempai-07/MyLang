import { Stmt } from "../Stmt";
import type { StmtType } from "../StmtType";
import type { Position } from "../../lexer/Token";

class VariableDeclaration extends Stmt {
  public readonly name: string;
  public readonly value: StmtType;
  public readonly constant: boolean;
  public readonly position: Position;

  constructor(
    name: string,
    value: StmtType,
    constant: boolean,
    position: Position,
  ) {
    super();

    this.name = name;

    this.value = value;

    this.constant = constant;

    this.position = position;
  }

  override evaluate(score: Record<string, any>) {
    score[this.name] = { value: this.value, constant: this.constant };

    const result = score[this.name]?.value?.evaluate(score);

    if (result) {
      return result;
    }

    return score[this.name].value;
  }
}

export { VariableDeclaration };
