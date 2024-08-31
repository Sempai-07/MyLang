import { Stmt } from "../Stmt";
import type { StmtType } from "../StmtType";
import type { Position } from "../../lexer/Token";
import { MemberExpression } from "./MemberExpression";

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
    const args = this.argument.map((arg) => arg.evaluate(score));

    if (!this.callee) {
      const methodRef = score[this.identifier]?.[this.method];
      if (!methodRef) {
        throw new Error(`Invalid identity ${this.identifier}`);
      }

      return methodRef(args, score);
    }

    const obj = this.callee.evaluate(score);
    const methodRef = obj[this.method];

    if (typeof methodRef !== "function") {
      throw new Error(`Method "${this.method}" not found on ${obj}`);
    }

    return methodRef(args, score);
  }
}

export { CallExpression };
