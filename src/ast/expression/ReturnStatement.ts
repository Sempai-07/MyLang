import { Stmt } from "../Stmt";
import type { StmtType } from "../StmtType";
import type { Position } from "../../lexer/Token";

class ReturnStatement extends Stmt {
  public readonly value: StmtType;
  public readonly position: Position;

  constructor(value: StmtType, position: Position) {
    super();
    this.value = value;

    this.position = position;
  }

  override evaluate(score: Record<string, any>) {
    return this.value.evaluate(score);
  }
}

export { ReturnStatement };
