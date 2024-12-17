import { StmtType } from "../StmtType";
import { type Position } from "../../lexer/Position";

class BoolLiteral extends StmtType {
  public readonly value: string;
  public readonly position: Position;

  constructor(value: string, position: Position) {
    super();

    this.value = value;

    this.position = position;
  }

  override evaluate(): boolean {
    return this.value === "true";
  }
}

export { BoolLiteral };
