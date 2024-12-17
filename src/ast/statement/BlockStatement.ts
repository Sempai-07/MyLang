import { StmtType } from "../StmtType";
import { type Position } from "../../lexer/Position";
import { NilLiteral } from "../types/NilLiteral";
import { Environment } from "../../Environment";
import { AssignmentExpression } from "../expression/AssignmentExpression";

class BlockStatement extends StmtType {
  public readonly body: StmtType[];
  public readonly position: Position;

  constructor(body: StmtType[], position: Position) {
    super();

    this.body = body;

    this.position = position;
  }

  override evaluate(score: Environment): any {
    let result: unknown = new NilLiteral(this.position);

    const callEnvironment = new Environment(score);

    for (const body of this.body) {
      if (body instanceof AssignmentExpression) {
        const evaluate = body.evaluate(score);
        result = evaluate;
        continue;
      }
      const evaluate = body.evaluate(callEnvironment);
      result = evaluate;
    }

    return result;
  }
}

export { BlockStatement };
