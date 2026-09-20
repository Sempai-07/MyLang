import { deepEqual } from "node:assert";
import { StmtType } from "../StmtType";
import { type Position } from "../../lexer/token/Position";
import { OperatorType } from "../../lexer/token/TokenType";
import { Environment } from "../../Environment";
import { OperatorError, OperatorCodeError } from "../../errors/runtime/OperatorError";

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

  constructor(operator: OperatorType, left: StmtType, right: StmtType, position: Position) {
    super();

    this.operator = operator;

    this.left = left;

    this.right = right;

    this.position = position;
  }

  async evaluate(score: Environment) {
    try {
      const left = (await this.left.evaluate(score)) as any;
      const right = await this.right.evaluate(score);

      switch (this.operator) {
        case OperatorType.Add: {
          return left + right;
        }
        case OperatorType.Subtract: {
          return left - right;
        }
        case OperatorType.Multiply: {
          return left * right;
        }
        case OperatorType.Exponentiation: {
          return left ** right;
        }
        case OperatorType.Modulo: {
          return left % right;
        }
        case OperatorType.Divide: {
          return left / right;
        }
        case OperatorType.Equal: {
          return deepEqualTry(left, right);
        }
        case OperatorType.NotEqual: {
          return !deepEqualTry(left, right);
        }
        case OperatorType.GreaterThan: {
          return left > right;
        }
        case OperatorType.LessThan: {
          return left < right;
        }
        case OperatorType.GreaterThanOrEqual: {
          return left >= right;
        }
        case OperatorType.LessThanOrEqual: {
          return left <= right;
        }
        case OperatorType.LogicalAnd: {
          return left & right;
        }
        case OperatorType.And: {
          return left && right;
        }
        case OperatorType.LogicalOr: {
          return left | right;
        }
        case OperatorType.BitXor: {
          return left ^ right;
        }
        case OperatorType.Or: {
          return left || right;
        }
        case OperatorType.ShiftLeft: {
          return left << right;
        }
        case OperatorType.ShiftRight: {
          return left >> right;
        }
        case OperatorType.ShiftRightZeroFill: {
          return left >>> right;
        }
        default: {
          throw new OperatorError(OperatorCodeError.UnknownBinaryOperator, {
            operatorType: this.operator,
            files: score.get("import").paths,
          });
        }
      }
    } catch (err) {
      throw super.throwErrorFormatters(err, score);
    }
  }
}

export { BinaryExpression };
