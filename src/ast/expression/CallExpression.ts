import { Stmt } from "../Stmt";
import type { StmtType } from "../StmtType";
import type { Position } from "../../lexer/Token";
import { MemberExpression } from "./MemberExpression";
import { TypeError, TypeCodeError } from "../../errors/TypeError";

class CallExpression extends Stmt {
  public readonly identifier: string;
  public readonly method: string;
  public readonly callee: MemberExpression | null;
  public readonly argument: StmtType[];
  public readonly position: Position;

  constructor(
    identifier: string,
    method: string,
    callee: MemberExpression | null,
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

  override evaluate(score: Record<string, any>) {
    if (!(this.identifier in score)) {
      throw new TypeError(TypeCodeError.InvalidIdentifier, {
        value: this.identifier,
      }).genereteMessage(score.import.paths, this.position);
    }

    const args = this.argument.map((arg) => arg.evaluate(score));

    if (!this.callee) {
      const methodVar = score[this.identifier]?.value;

      if (methodVar instanceof Stmt) {
        const methodRef = methodVar.evaluate(score)?.[this.method];

        if (!methodRef) {
          throw new TypeError(TypeCodeError.InvalidMethodCall, {
            variable: this.identifier,
            method: this.method,
          }).genereteMessage(score.import.paths, this.position);
        }

        return methodRef(args, score);
      }

      const methodRef = score[this.identifier]?.[this.method];

      if (!methodRef) {
        throw new TypeError(TypeCodeError.InvalidMethodCall, {
          variable: this.identifier,
          method: this.method,
        }).genereteMessage(score.import.paths, this.position);
      }

      return methodRef(args, score);
    }

    const obj = this.callee.evaluate(score);
    const methodRef = obj[this.method];

    if (typeof methodRef !== "function") {
      throw new TypeError(TypeCodeError.InvalidIdentifier, {
        value: this.method,
      }).genereteMessage(score.import.paths, this.position);
    }

    return methodRef(args, score);
  }
}

export { CallExpression };
