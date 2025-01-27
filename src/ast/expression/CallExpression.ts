import { StmtType } from "../StmtType";
import { type Position } from "../../lexer/Position";
import { MemberExpression } from "./MemberExpression";
import { IdentifierLiteral } from "../types/IdentifierLiteral";
import { Environment } from "../../Environment";
import { FunctionDeclaration } from "../declaration/FunctionDeclaration";
import { FunctionExpression } from "../expression/FunctionExpression";
import { FunctionCallError, BaseError } from "../../errors/BaseError";

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
    try {
      if (!this.callee) {
        if (
          score.get(this.identifier) instanceof FunctionDeclaration ||
          score.get(this.identifier) instanceof FunctionExpression
        ) {
          return score
            .get(this.identifier)
            .call(this.argument.map((arg) => arg.evaluate(score)));
        }

        if (!(this.method in score.get(this.identifier))) {
          throw new FunctionCallError(
            `${this.identifier}.${this.method} is not method`,
            score.get("import").paths,
          );
        }

        const methodVar = score.get(this.identifier)[this.method];

        if (
          methodVar instanceof FunctionDeclaration ||
          methodVar instanceof FunctionExpression
        ) {
          return methodVar.call(
            this.argument.map((arg) => arg.evaluate(score)),
          );
        }

        return methodVar(
          this.argument.map((arg) => arg.evaluate(score)),
          score,
        );
      }

      const obj = this.callee.evaluate(score);

      const methodRef = obj?.[this.method];

      if (
        methodRef instanceof FunctionDeclaration ||
        methodRef instanceof FunctionExpression
      ) {
        return methodRef.call(
          this.argument.map((arg) => arg.evaluate(score)),
          this.callee instanceof MemberExpression
            ? this.callee.obj.evaluate(methodRef.parentEnv)?.[
                this.callee.property.evaluate(methodRef.parentEnv)
              ]
            : this.callee.evaluate(score),
        );
      }

      if (typeof methodRef !== "function") {
        throw new FunctionCallError(
          `${this.identifier}.${this.method} is not method`,
          score.get("import").paths,
        );
      }

      return methodRef(
        this.argument.map((arg) => arg.evaluate(score)),
        score,
      );
    } catch (err) {
      if (err instanceof BaseError) {
        err.files = Array.from(
          new Set([score.get("import").main, ...err.files]),
        ).map((file) => {
          if (file === score.get("import").main) {
            return `${this.identifier}.${this.method} (${file}:${this.position.line}:${this.position.column})`;
          }
          return file;
        });
      }
      throw err;
    }
  }
}

export { CallExpression };
