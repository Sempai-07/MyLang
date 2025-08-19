import { StmtType } from "../StmtType";
import { OperatorType } from "../../lexer/token/TokenType";
import { type Position } from "../../lexer/token/Position";
import { type Environment } from "../../Environment";
import { type IdentifierLiteral } from "../types/IdentifierLiteral";
import { OperatorError, OperatorCodeError } from "../../errors/runtime/OperatorError";
import { isTypeArgs } from "../../../library/utils/utils";

class UpdateExpression extends StmtType {
  public readonly operator: OperatorType;
  public readonly argument: IdentifierLiteral;
  public readonly position: Position;

  constructor(argument: IdentifierLiteral, operator: OperatorType, position: Position) {
    super();

    this.argument = argument;

    this.operator = operator;

    this.position = position;
  }

  async evaluate(score: Environment) {
    try {
      let currentValue;

      try {
        currentValue = await this.argument.evaluate(score);
      } catch (err) {
        throw String(err);
      }

      if (typeof currentValue !== "number") {
        throw new OperatorError(OperatorCodeError.UpdateOnlyNumber, {
          type: isTypeArgs(currentValue),
          files: score.get("import").paths,
        });
      }

      let nextValue = currentValue;

      switch (this.operator) {
        case OperatorType.PlusPlus:
          nextValue += 1;
          break;
        case OperatorType.MinusMinus:
          nextValue -= 1;
          break;
        default:
          throw new OperatorError(OperatorCodeError.UnknownUpdateOperator, {
            operatorType: this.operator,
            files: score.get("import").paths,
          });
      }

      score.update(this.argument.value, nextValue);

      return currentValue;
    } catch (err) {
      throw super.throwErrorFormatters(err, score);
    }
  }
}

export { UpdateExpression };
