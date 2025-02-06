import { StmtType } from "../StmtType";
import { type Position } from "../../lexer/Position";
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

  evaluate(score: Environment) {
    const deferenceCall: Array<[Environment, DeferDeclaration]> = [];

    try {
      for (let i = 0; i < this.body.length; i++) {
        if (runtime.isReturn || runtime.isBreak) {
          break;
        }

        if (this.body[i] instanceof DeferDeclaration) {
          deferenceCall.push([score.clone(), this.body[i] as DeferDeclaration]);
        } else {
          runtime.callStack.add(score, this.body[i]!);

          if (!runtime.isContinue) {
            runtime.resume();
          } else {
            runtime.resetContinue();
            continue;
          }
        }
      }
    } catch (err) {
      throw err;
    } finally {
      if (deferenceCall.length) {
        const _isBreak = runtime.isBreak;
        const _isReturn = runtime.isReturn;
        const _isContinue = runtime.isContinue;
        const result = runtime.getLastFunctionExecutionResult();

        // @ts-expect-error
        runtime._isBreak = false;
        // @ts-expect-error
        runtime._isReturn = false;
        // @ts-expect-error
        runtime._isContinue = false;

        for (const [score, defer] of deferenceCall) {
          defer.evaluate(score);
        }

        // @ts-expect-error
        runtime._isBreak = _isBreak;
        // @ts-expect-error
        runtime._isReturn = _isReturn;
        // @ts-expect-error
        runtime._isContinue = _isContinue;
        // @ts-expect-error
        runtime._lastFunctionExecutionResult = result;
      }
    }
  }
}

export { BlockStatement };
