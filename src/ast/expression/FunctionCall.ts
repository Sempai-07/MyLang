import { StmtType } from "../StmtType";
import { type Position } from "../../lexer/Position";
import { FunctionDeclaration } from "../declaration/FunctionDeclaration";
import { FunctionExpression } from "../expression/FunctionExpression";
import { Environment } from "../../Environment";
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
    const func = score.get(this.name);

    if (
      func instanceof FunctionDeclaration ||
      func instanceof FunctionExpression
    ) {
      runtime.markFunctionCallPosition();

      func
        .evaluate(func.parentEnv)
        .call(this.argument.map((arg) => arg.evaluate(func.parentEnv)));

      const result = runtime.getLastFunctionExecutionResult();
      runtime.resetLastFunctionExecutionResult();

      return result;
    }

    if (typeof func === "function") {
      runtime.markFunctionCallPosition();

      return func(
        this.argument.map((arg) => arg.evaluate(func.parentEnv)),
        score,
      );
    }

    return null;
  }
}

export { FunctionCall };
