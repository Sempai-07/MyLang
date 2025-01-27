import { StmtType } from "../StmtType";
import { type BlockStatement } from "./BlockStatement";
import { Environment } from "../../Environment";
import { type Position } from "../../lexer/Position";

class TryCatchStatement extends StmtType {
  public readonly tryBlock: BlockStatement;
  public readonly catchBlock: [string | null, BlockStatement] | null;
  public readonly finallyBlock: BlockStatement | null;
  public readonly position: Position;

  constructor(
    tryBlock: BlockStatement,
    catchBlock: [string | null, BlockStatement] | null,
    finallyBlock: BlockStatement | null,
    position: Position,
  ) {
    super();

    this.tryBlock = tryBlock;

    this.catchBlock = catchBlock;

    this.finallyBlock = finallyBlock;

    this.position = position;
  }

  evaluate(score: Environment) {
    try {
      const callEnvironment = new Environment(score);
      this.tryBlock.evaluate(callEnvironment);
    } catch (err) {
      if (this.catchBlock) {
        const callEnvironment = new Environment(score);
        if (this.catchBlock[0]) {
          callEnvironment.create(this.catchBlock[0], err);
          this.catchBlock[1].evaluate(callEnvironment);
        } else this.catchBlock[1].evaluate(callEnvironment);
      }
    } finally {
      if (this.finallyBlock) {
        const callEnvironment = new Environment(score);
        this.finallyBlock.evaluate(callEnvironment);
      }
    }
  }
}

export { TryCatchStatement };
