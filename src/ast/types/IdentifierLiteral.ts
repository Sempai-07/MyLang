import { StmtType } from "../StmtType";
import { type Position } from "../../lexer/Position";
import { Environment } from "../../Environment";

class IdentifierLiteral extends StmtType {
  public readonly value: string;
  public readonly position: Position;

  constructor(value: string, position: Position) {
    super();

    this.value = value;

    this.position = position;
  }

  override evaluate(score: Environment): any {
    return score.get(this.value);
  }
}

export { IdentifierLiteral };