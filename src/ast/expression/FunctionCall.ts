import { StmtType } from "../StmtType";
import { type Position } from "../../lexer/Position";
import { FunctionDeclaration } from "../declaration/FunctionDeclaration";
import { FunctionExpression } from "../expression/FunctionExpression";
import { Environment } from "../../Environment";
import { BaseError } from "../../errors/BaseError";
import { runtime } from "../../runtime/Runtime";

class FunctionCall extends StmtType {
  public readonly name: string;
  public readonly argument: StmtType[];
  public readonly position: Position;

  constructor(name: string, argument: StmtType[], position: Position) {
    super();

    this.name = name;

    this.argument = argument;

    this.position = position;
  }

  evaluate(score: Environment) {
    try {
      const func = score.get(this.name);

      if (
        func instanceof FunctionDeclaration ||
        func instanceof FunctionExpression
      ) {
        runtime.markFunctionCallPosition();

        return func
          .evaluate(func.parentEnv)
          .call(this.argument.map((arg) => arg.evaluate(func.parentEnv)));
      }

      if (typeof func === "function") {
        return func(
          this.argument.map((arg) => arg.evaluate(func.parentEnv)),
          score,
        );
      }

      return null;
    } catch (err) {
      if (err instanceof BaseError) {
        err.files = Array.from(
          new Set([score.get("import").main, ...err.files]),
        ).map((file) => {
          if (file === score.get("import").main) {
            return `${this.name} (${file}:${this.position.line}:${this.position.column})`;
          }
          return file;
        });
      }
      throw err;
    }
  }
}

export { FunctionCall };
