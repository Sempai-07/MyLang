import { Stmt } from "../Stmt";
import type { StmtType } from "../StmtType";
import type { Position } from "../../lexer/Token";
import { ReturnStatement } from "./ReturnStatement";

class BlockStatement extends Stmt {
  public readonly body: StmtType[];
  public readonly position: Position;

  constructor(body: StmtType[], position: Position) {
    super();

    this.body = body;

    this.position = position;
  }

  override evaluate(score: Record<string, any>) {
    let result: unknown = null;
    for (const body of this.body) {
      const evaluate = body.evaluate(score);
      if (body instanceof ReturnStatement) {
        result = evaluate;
      }
    }
    return result;
  }
}

export { BlockStatement };
