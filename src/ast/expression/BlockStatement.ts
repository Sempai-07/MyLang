import { Stmt } from "../Stmt";
import type { StmtType } from "../StmtType";
import type { Position } from "../../lexer/Token";

class BlockStatement extends Stmt {
  public readonly body: StmtType[];
  public readonly position: Position;

  constructor(body: StmtType[], position: Position) {
    super();

    this.body = body;

    this.position = position;
  }

  override evaluate() {
    return this.body;
  }
}

export { BlockStatement };
