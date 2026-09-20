import { StmtType } from "../StmtType";
import { type Position } from "../../lexer/token/Position";
import { Environment } from "../../Environment";
import { type BlockStatement } from "./BlockStatement";
import { runtime } from "../../runtime/Runtime";

class ForStatement extends StmtType {
  public readonly init: StmtType | null;
  public readonly test: StmtType | null;
  public readonly update: StmtType | null;
  public readonly body: BlockStatement;
  public readonly position: Position;

  constructor(
    init: StmtType | null,
    test: StmtType | null,
    update: StmtType | null,
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

  async evaluate(score: Environment) {
    try {
      const bridgeEnvironment = new Environment(score);

      runtime.markIterationCallPosition();

      await this.init?.evaluate(bridgeEnvironment);

      if (this.test) {
        while (
          !runtime.isBreak &&
          !runtime.isReturn &&
          (await this.test.evaluate(bridgeEnvironment))
        ) {
          const executionEnvironment = new Environment(bridgeEnvironment);
          await this.body.evaluate(executionEnvironment);
          await this.update?.evaluate(executionEnvironment);
        }
      } else {
        while (!runtime.isBreak && !runtime.isReturn) {
          const executionEnvironment = new Environment(bridgeEnvironment);
          await this.body.evaluate(executionEnvironment);
          await this.update?.evaluate(executionEnvironment);
        }
      }

      runtime.resetBreak();
      runtime.finishIteration();
    } catch (err) {
      throw super.throwErrorFormatters(err, score);
    }
  }
}

export { ForStatement };
