import { StmtType } from "../StmtType";
import { type Position } from "../../lexer/Position";
import { Environment } from "../../Environment";
import { runtime } from "../../runtime/Runtime";

class BlockStatement extends StmtType {
  public readonly body: StmtType[];
  public readonly position: Position;

  constructor(body: StmtType[], position: Position) {
    super();

    this.body = body;

    this.position = position;
  }

  evaluate(score: Environment) {
    for (let i = 0; i < this.body.length; i++) {
      if (runtime.isReturn || runtime.isBreak) {
        break;
      }

      runtime.callStack.add(score, this.body[i]!);

      if (!runtime.isContinue) {
        runtime.resume();
      } else {
        runtime.resetContinue();
        continue;
      }
    }
  }
}

export { BlockStatement };
