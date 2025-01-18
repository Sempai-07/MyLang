import { deepEqual } from "node:assert";
import { StmtType } from "../StmtType";
import { type Position } from "../../lexer/Position";
import { OperatorType } from "../../lexer/TokenType";
import { FunctionExpression } from "./FunctionExpression";
import { FunctionDeclaration } from "../declaration/FunctionDeclaration";
import { Environment } from "../../Environment";

function deepEqualTry(actual: unknown, expected: unknown) {
  try {
    deepEqual(actual, expected);
    return true;
  } catch {
    return false;
  }
}

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

  evaluate(score: Environment) {
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
        return deepEqualTry(left, this.right.evaluate(score));
      }
      case OperatorType.NotEqual: {
        return !deepEqualTry(left, this.right.evaluate(score));
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
      case OperatorType.PipeLine: {
        const callExpression = this.right.evaluate(score);
        if (
          !(
            callExpression instanceof FunctionExpression ||
            callExpression instanceof FunctionDeclaration
          )
        ) {
          throw "Expect function, for |> operator";
        }
        return this.right.evaluate(score).call([left]);
      }
      default: {
        throw `Invalid operator "${this.operator}"`;
      }
    }
  }
}

export { BinaryExpression };
