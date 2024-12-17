import { StmtType } from "../StmtType";
import { type Position } from "../../lexer/Position";

class StringLiteral extends StmtType {
  public readonly value: string;
  public readonly position: Position;

  constructor(value: string, position: Position) {
    super();

    this.value = value;

    this.position = position;
  }

  override evaluate(): string {
    return this.value;
  }
}

export { StringLiteral };
