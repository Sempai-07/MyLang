import { StmtType } from "../StmtType";
import { type Position } from "../../lexer/Position";

class BreakStatement extends StmtType {
  public readonly position: Position;

  constructor(position: Position) {
    super();

    this.position = position;
  }

  evaluate() {
    return null;
  }
}

export { BreakStatement };
