import { StmtType } from "../StmtType";
import { type Position } from "../../lexer/Position";
import { MemberExpression } from "./MemberExpression";
import { IdentifierLiteral } from "../types/IdentifierLiteral";
import { Environment } from "../../Environment";
import { FunctionDeclaration } from "../declaration/FunctionDeclaration";
import { FunctionExpression } from "../expression/FunctionExpression";
import { runtime } from "../../runtime/Runtime";

class CallExpression extends StmtType {
  public readonly identifier: string;
  public readonly method: string;
  public readonly callee: MemberExpression | IdentifierLiteral | null;
  public readonly argument: StmtType[];
  public readonly position: Position;

  constructor(
    identifier: string,
    method: string,
    callee: MemberExpression | IdentifierLiteral | null,
    argument: StmtType[],
    position: Position,
  ) {
    super();

    this.identifier = identifier;

    this.method = method;

    this.callee = callee;

    this.argument = argument;

    this.position = position;
  }

  evaluate(score: Environment) {
    if (!this.callee) {
      if (
        score.get(this.identifier) instanceof FunctionDeclaration ||
        score.get(this.identifier) instanceof FunctionExpression
      ) {
        runtime.markFunctionCallPosition();

        score
          .get(this.identifier)
          .call(this.argument.map((arg) => arg.evaluate(score)));

        const result = runtime.getLastFunctionExecutionResult();
        runtime.resetLastFunctionExecutionResult();

        return result;
      }

      if (!(this.method in score.get(this.identifier))) {
        throw `${this.identifier}.${this.method} is not method`;
      }

      const methodVar = score.get(this.identifier)[this.method];

      if (
        methodVar instanceof FunctionDeclaration ||
        methodVar instanceof FunctionExpression
      ) {
        runtime.markFunctionCallPosition();

        methodVar.call(this.argument.map((arg) => arg.evaluate(score)));

        const result = runtime.getLastFunctionExecutionResult();
        runtime.resetLastFunctionExecutionResult();

        return result;
      }

      runtime.markFunctionCallPosition();

      methodVar(
        this.argument.map((arg) => arg.evaluate(score)),
        score,
      );

      const result = runtime.getLastFunctionExecutionResult();
      runtime.resetLastFunctionExecutionResult();

      return result;
    }

    const obj = this.callee.evaluate(score);

    const methodRef = obj?.[this.method];

    if (
      methodRef instanceof FunctionDeclaration ||
      methodRef instanceof FunctionExpression
    ) {
      runtime.markFunctionCallPosition();

      methodRef.call(
        this.argument.map((arg) => arg.evaluate(score)),
        this.callee instanceof MemberExpression
          ? this.callee.obj.evaluate(methodRef.parentEnv)
          : this.callee.evaluate(methodRef.parentEnv),
      );

      const result = runtime.getLastFunctionExecutionResult();
      runtime.resetLastFunctionExecutionResult();

      return result;
    }

    if (typeof methodRef !== "function") {
      throw `${this.identifier}.${this.method} is not method`;
    }

    runtime.markFunctionCallPosition();

    const result = methodRef(
      this.argument.map((arg) => arg.evaluate(score)),
      score,
    );

    runtime.resetLastFunctionExecutionResult();

    return result;
  }
}

export { CallExpression };
