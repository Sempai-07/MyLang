import { StmtType } from "../StmtType";
import { BaseError } from "../../errors/BaseError";
import { Task } from "../../runtime/task/Task";
import { type Position } from "../../lexer/Position";
import { Environment } from "../../Environment";
import { PromiseCustom } from "../../native/lib/promises/symbol";

class AwaitExpression extends StmtType {
  public readonly position: Position;
  public readonly value: StmtType;

  constructor(value: StmtType, position: Position) {
    super();

    this.value = value;

    this.position = position;
  }

  evaluate(score: Environment) {
    try {
      const value = this.value.evaluate(score);

      if (!(value instanceof Task)) {
        throw new BaseError("await can only be used on promises", {
          files: score.get("import").paths,
        });
      }

      value[PromiseCustom]?.start();

      return value[PromiseCustom]?.getResult();
    } catch (err) {
      if (err instanceof BaseError) {
        err.files = Array.from(
          new Set([score.get("import").main, ...err.files]),
        ).map((file) => {
          if (file === score.get("import").main) {
            return `await (${file}:${this.position.line}:${this.position.column})`;
          }
          return file;
        });
      }
      throw err;
    }
  }
}

export { AwaitExpression };
