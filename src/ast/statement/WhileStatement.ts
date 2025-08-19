import { StmtType } from "../StmtType";
import { type Position } from "../../lexer/token/Position";
import { Environment } from "../../Environment";
import { type BlockStatement } from "./BlockStatement";
import { runtime } from "../../runtime/Runtime";

class WhileStatement extends StmtType {
  public readonly test: StmtType;
  public readonly body: BlockStatement;
  public readonly position: Position;

  constructor(test: StmtType, body: BlockStatement, position: Position) {
    super();

    this.test = test;

    this.body = body;

    this.position = position;
  }

  async evaluate(score: Environment) {
    try {
      const bridgeEnvironment = new Environment(score);

      runtime.markIterationCallPosition();

      while (
        !runtime.isReturn &&
        !runtime.isBreak &&
        (await this.test.evaluate(bridgeEnvironment))
      ) {
        const executionEnvironment = new Environment(bridgeEnvironment);
        await this.body.evaluate(executionEnvironment);
      }

      runtime.resetBreak();
    } catch (err) {
      throw super.throwErrorFormatters(err, score);
    }
  }
}

export { WhileStatement };
