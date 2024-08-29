import { Stmt } from "../Stmt";
import type { Position } from "../../lexer/Token";

class NumberLiteral extends Stmt {
  public readonly value: string;
  public readonly position: Position;

  constructor(value: string, position: Position) {
    super();

    this.value = value;

    this.position = position;
  }

  override evaluate() {
    return Number(this.value);
  }
}

export { NumberLiteral };
