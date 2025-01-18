import { StmtType } from "../StmtType";
import { type Position } from "../../lexer/Position";
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

  evaluate(score: Environment) {
    const bridgeEnvironment = new Environment(score);
    runtime.markIterationCallPosition();

    while (
      !runtime.isReturn &&
      !runtime.isBreak &&
      this.test.evaluate(bridgeEnvironment)
    ) {
      const executionEnvironment = new Environment(bridgeEnvironment);
      this.body.evaluate(executionEnvironment);
    }

    runtime.resetIsBreak();
  }
}

export { WhileStatement };
