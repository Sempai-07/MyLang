import { StmtType } from "../StmtType";
import { type Position } from "../../lexer/token/Position";
import { Environment } from "../../Environment";
import { DeferDeclaration } from "../declaration/DeferDeclaration";
import { runtime } from "../../runtime/Runtime";

class BlockStatement extends StmtType {
  public readonly body: StmtType[];
  public readonly position: Position;

  constructor(body: StmtType[], position: Position) {
    super();

    this.body = body;

    this.position = position;
  }

  async evaluate(score: Environment) {
    const deferenceCall: Array<[Environment, DeferDeclaration]> = [];

    try {
      for (let i = 0; i < this.body.length; i++) {
        if (runtime.isReturn || runtime.isBreak) {
          break;
        }

        const blockStatement = this.body[i]!;

        if (blockStatement instanceof DeferDeclaration) {
          if (blockStatement.value instanceof BlockStatement) {
            deferenceCall.push([score, blockStatement]);
            continue;
          }
          deferenceCall.push([score.clone(), blockStatement]);
        } else {
          runtime.callStack.add(score, blockStatement);

          if (!runtime.isContinue) {
            await runtime.resume();
          } else {
            runtime.resetContinue();
            continue;
          }
        }
      }
    } catch (err) {
      throw err;
    } finally {
      const _isBreak = runtime.isBreak;
      const _isReturn = runtime.isReturn;
      const _isContinue = runtime.isContinue;
      const result = runtime.getLastExecutionResult();

      if (deferenceCall.length) {
        for (const [score, defer] of deferenceCall) {
          runtime.resetAll();
          await defer.evaluate(score);
        }
      }

      // @ts-expect-error
      runtime._isBreak = _isBreak;
      // @ts-expect-error
      runtime._isReturn = _isReturn;
      // @ts-expect-error
      runtime._isContinue = _isContinue;
      // @ts-expect-error
      runtime._lastExecutionResult = result;
    }
  }
}

export { BlockStatement };
