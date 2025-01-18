import { StmtType } from "../StmtType";
import { OperatorType } from "../../lexer/TokenType";
import { type Position } from "../../lexer/Position";
import { type Environment } from "../../Environment";
import { type IdentifierLiteral } from "../types/IdentifierLiteral";

class UpdateExpression extends StmtType {
  public readonly operator: OperatorType;
  public readonly argument: IdentifierLiteral;
  public readonly position: Position;

  constructor(
    argument: IdentifierLiteral,
    operator: OperatorType,
    position: Position,
  ) {
    super();

    this.argument = argument;

    this.operator = operator;

    this.position = position;
  }

  evaluate(score: Environment) {
    let currentValue;

    try {
      currentValue = this.argument.evaluate(score);
    } catch (err) {
      throw String(err);
    }
    if (typeof currentValue !== "number") {
      throw "Update expression only work on number";
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
        throw `Unrecognized operator ${this.operator}`;
    }

    score.update(this.argument.value, nextValue);

    return currentValue;
  }
}

export { UpdateExpression };
