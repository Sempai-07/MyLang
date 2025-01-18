import { StmtType } from "../StmtType";
import { type Position } from "../../lexer/Position";
import { Environment } from "../../Environment";

class ReturnStatement extends StmtType {
  public readonly body: StmtType | StmtType[];
  public readonly position: Position;

  constructor(body: StmtType | StmtType[], position: Position) {
    super();

    this.body = body;

    this.position = position;
  }

  evaluate(score: Environment) {
    if (!(this.body instanceof StmtType)) {
      return this.body;
    }
    if (Array.isArray(this.body)) {
      return this.body.map((value) => value.evaluate(score));
    }
    return this.body.evaluate(score);
  }
}

export { ReturnStatement };
