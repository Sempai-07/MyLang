import { StmtType } from "../StmtType";
import { type Position } from "../../lexer/Position";
import { FunctionDeclaration } from "../declaration/FunctionDeclaration";
import { IdentifierLiteral } from "../types/IdentifierLiteral";
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

        const combinedScore = score.combine(func.parentEnv);

        return func.call(
          this.argument.map((arg) => {
            const result = arg.evaluate(combinedScore);
            if (arg instanceof IdentifierLiteral) {
              const variableOpts = combinedScore.optionsVar[arg.value];
              return {
                ...(variableOpts && { options: variableOpts }),
                value: result,
              };
            }
            return { value: result };
          }),
        );
      }

      if (typeof func === "function") {
        return func(
          this.argument.map((arg) => arg.evaluate(score)),
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
