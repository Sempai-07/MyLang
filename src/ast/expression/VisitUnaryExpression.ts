import { StmtType } from "../StmtType";
import { type Position } from "../../lexer/Position";
import { OperatorType } from "../../lexer/TokenType";
import { Environment } from "../../Environment";

class VisitUnaryExpression extends StmtType {
  public readonly operator: OperatorType;
  public readonly position: Position;
  public readonly right: StmtType;

  constructor(operator: OperatorType, right: StmtType, position: Position) {
    super();

    this.operator = operator;

    this.right = right;

    this.position = position;
  }

  override evaluate(score: Environment): any {
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
        throw `Invalid operator "${this.operator}"`;
      }
    }
  }
}

export { VisitUnaryExpression };
