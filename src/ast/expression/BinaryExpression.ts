import { StmtType } from "../StmtType";
import { type Position } from "../../lexer/Position";
import { OperatorType } from "../../lexer/TokenType";
import { Environment } from "../../Environment";

class BinaryExpression extends StmtType {
  public readonly operator: OperatorType;
  public readonly position: Position;
  public readonly left: StmtType;
  public readonly right: StmtType;

  constructor(
    operator: OperatorType,
    left: StmtType,
    right: StmtType,
    position: Position,
  ) {
    super();

    this.operator = operator;

    this.left = left;

    this.right = right;

    this.position = position;
  }

  override evaluate(score: Environment): any {
    const left = this.left.evaluate(score) as any;

    switch (this.operator) {
      case OperatorType.Add: {
        return left + this.right.evaluate(score);
      }
      case OperatorType.Subtract: {
        return left - this.right.evaluate(score);
      }
      case OperatorType.Multiply: {
        return left * this.right.evaluate(score);
      }
      case OperatorType.Modulo: {
        return left % this.right.evaluate(score);
      }
      case OperatorType.Divide: {
        return left / this.right.evaluate(score);
      }
      case OperatorType.Equal: {
        return left == this.right.evaluate(score);
      }
      case OperatorType.NotEqual: {
        return left != this.right.evaluate(score);
      }
      case OperatorType.GreaterThan: {
        return left > this.right.evaluate(score);
      }
      case OperatorType.LessThan: {
        return left < this.right.evaluate(score);
      }
      case OperatorType.GreaterThanOrEqual: {
        return left >= this.right.evaluate(score);
      }
      case OperatorType.LessThanOrEqual: {
        return left <= this.right.evaluate(score);
      }
      case OperatorType.LogicalAnd: {
        return left & this.right.evaluate(score);
      }
      case OperatorType.And: {
        return left && this.right.evaluate(score);
      }
      case OperatorType.LogicalOr: {
        return left | this.right.evaluate(score);
      }
      case OperatorType.Or: {
        return left || this.right.evaluate(score);
      }
      default: {
        throw `Invalid operator "${this.operator}"`;
      }
    }
  }
}

export { BinaryExpression };
