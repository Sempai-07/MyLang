import { Stmt } from "../Stmt";
import type { StmtType } from "../StmtType";
import type { Position } from "../../lexer/Token";
import { OperatorType } from "../../lexer/TokenType";

class VisitUnaryExpression extends Stmt {
  public readonly operator: OperatorType;
  public readonly position: Position;
  public readonly right: StmtType;

  constructor(operator: OperatorType, right: StmtType, position: Position) {
    super();

    this.operator = operator;

    this.right = right;

    this.position = position;
  }

  override evaluate(score: Record<string, any>) {
    switch (this.operator) {
      case OperatorType.Add: {
        return +this.right.evaluate(score);
      }
      case OperatorType.Subtract: {
        return -this.right.evaluate(score);
      }
      case OperatorType.Not: {
        return !this.right.evaluate(score);
      }
      default: {
        throw new Error(`Invalid operator "${this.operator}"`);
      }
    }
  }
}

export { VisitUnaryExpression };
