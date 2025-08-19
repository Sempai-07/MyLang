import { StmtType } from "../StmtType";
import { type Position } from "../../lexer/token/Position";
import { Environment } from "../../Environment";

class ReturnStatement extends StmtType {
  public readonly body: StmtType | StmtType[];
  public readonly position: Position;

  constructor(body: StmtType | StmtType[], position: Position) {
    super();

    this.body = body;

    this.position = position;
  }

  async evaluate(score: Environment) {
    if (Array.isArray(this.body)) {
      return Promise.all(this.body.map((value) => value.evaluate(score)));
    }
    return this.body.evaluate(score);
  }
}

export { ReturnStatement };
