import { StmtType } from "../StmtType";
import { type Position } from "../../lexer/Position";
import { Environment } from "../../Environment";
import { type BlockStatement } from "./BlockStatement";
import { runtime } from "../../runtime/Runtime";
import { BaseError } from "../../errors/BaseError";

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
    try {
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
    } catch (err) {
      if (err instanceof BaseError) {
        err.files = Array.from(
          new Set([score.get("import").main, ...err.files]),
        ).map((file) => {
          if (file === score.get("import").main) {
            return `While (${file}:${this.position.line}:${this.position.column})`;
          }
          return file;
        });
      }
      throw err;
    }
  }
}

export { WhileStatement };
