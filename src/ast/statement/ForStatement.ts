import { StmtType } from "../StmtType";
import { type Position } from "../../lexer/Position";
import { Environment } from "../../Environment";
import { type BlockStatement } from "./BlockStatement";
import { BaseError } from "../../errors/BaseError";
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
    try {
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
    } catch (err) {
      if (err instanceof BaseError) {
        err.files = Array.from(
          new Set([score.get("import").main, ...err.files]),
        ).map((file) => {
          if (file === score.get("import").main) {
            return `For (${file}:${this.position.line}:${this.position.column})`;
          }
          return file;
        });
      }
      throw err;
    }
  }
}

export { ForStatement };
