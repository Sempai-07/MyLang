import { StmtType } from "../StmtType";
import { type Position } from "../../lexer/token/Position";
import { OperatorType } from "../../lexer/token/TokenType";
import { Environment } from "../../Environment";
import { OperatorError, OperatorCodeError } from "../../errors/runtime/OperatorError";

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

  async evaluate(score: Environment) {
    try {
      const rightValue = await this.right.evaluate(score);

      switch (this.operator) {
        case OperatorType.Add: {
          return +rightValue;
        }
        case OperatorType.Subtract: {
          return -rightValue;
        }
        case OperatorType.Not: {
          return !rightValue;
        }
        case OperatorType.BitNot: {
          return ~rightValue;
        }
        default: {
          throw new OperatorError(OperatorCodeError.UnknownVisitUnaryOperator, {
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

export { VisitUnaryExpression };
