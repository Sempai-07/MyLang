import { deepEqual } from "node:assert";
import { StmtType } from "../StmtType";
import { type Position } from "../../lexer/Position";
import { OperatorType } from "../../lexer/TokenType";
import { Environment } from "../../Environment";
import { BaseError } from "../../errors/BaseError";

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
    try {
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
        default: {
          throw new BaseError(`Invalid operator "${this.operator}"`, {
            files: score.get("import").paths,
          });
        }
      }
    } catch (err) {
      if (err instanceof BaseError) {
        err.files = Array.from(
          new Set([score.get("import").main, ...err.files]),
        ).map((file) => {
          if (file === score.get("import").main) {
            return `${file}:${this.position.line}:${this.position.column}`;
          }
          return file;
        });
      }
      throw err;
    }
  }
}

export { BinaryExpression };
