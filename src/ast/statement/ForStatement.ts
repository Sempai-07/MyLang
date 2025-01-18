import { StmtType } from "../StmtType";
import { type Position } from "../../lexer/Position";
import { Environment } from "../../Environment";
import { type BlockStatement } from "./BlockStatement";
import { runtime } from "../../runtime/Runtime";

class ForStatement extends StmtType {
  public readonly init: StmtType;
  public readonly test: StmtType;
  public readonly update: StmtType;
  public readonly body: BlockStatement;
  public readonly position: Position;

  constructor(
    init: StmtType,
    test: StmtType,
    update: StmtType,
    body: BlockStatement,
    position: Position,
  ) {
    super();

    this.init = init;

    this.test = test;

    this.update = update;

    this.body = body;

    this.position = position;
  }

  evaluate(score: Environment) {
    const bridgeEnvironment = new Environment(score);
    runtime.markIterationCallPosition();

    this.init.evaluate(bridgeEnvironment);

    while (
      !runtime.isBreak &&
      !runtime.isReturn &&
      this.test.evaluate(bridgeEnvironment)
    ) {
      const executionEnvironment = new Environment(bridgeEnvironment);
      this.body.evaluate(executionEnvironment);
      this.update.evaluate(executionEnvironment);
    }

    runtime.resetIsBreak();
  }
}

export { ForStatement };
