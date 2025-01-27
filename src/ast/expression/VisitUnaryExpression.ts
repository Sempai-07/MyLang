import { StmtType } from "../StmtType";
import { BaseError } from "../../errors/BaseError";
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

  evaluate(score: Environment) {
    try {
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

export { VisitUnaryExpression };
