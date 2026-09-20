import { StmtType } from "../StmtType";
import { BlockStatement } from "../statement/BlockStatement";
import { Environment } from "../../Environment";
import { type Position } from "../../lexer/token/Position";
import { runtime } from "../../runtime/Runtime";

class TryCatchExpression extends StmtType {
  public readonly tryBlock: StmtType;
  public readonly catchBlock: BlockStatement | [string | null, BlockStatement];
  public readonly position: Position;

  constructor(
    tryBlock: StmtType,
    catchBlock: BlockStatement | [string | null, BlockStatement],
    position: Position,
  ) {
    super();

    this.tryBlock = tryBlock;

    this.catchBlock = catchBlock;

    this.position = position;
  }

  async evaluate(score: Environment) {
    try {
      const callEnvironment = new Environment(score);
      await this.tryBlock.evaluate(callEnvironment);
    } catch (err) {
      if (this.catchBlock) {
        runtime.markFunctionCallPosition();

        const callEnvironment = new Environment(score);

        if (this.catchBlock instanceof BlockStatement) {
          callEnvironment.create("this", { error: err });
          await this.catchBlock.evaluate(callEnvironment);

          const result = runtime.getLastExecutionResult();
          runtime.resetLastExecutionResult();
          runtime.finishFunction();

          return result;
        }

        if (this.catchBlock[0]) {
          callEnvironment.create(this.catchBlock[0], err);
        }

        await this.catchBlock[1].evaluate(callEnvironment);

        const result = runtime.getLastExecutionResult();
        runtime.resetLastExecutionResult();
        runtime.finishFunction();

        return result;
      }
    }
  }
}

export { TryCatchExpression };
