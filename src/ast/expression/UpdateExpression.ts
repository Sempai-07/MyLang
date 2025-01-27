import { StmtType } from "../StmtType";
import { BaseError } from "../../errors/BaseError";
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
    try {
      let currentValue;

      try {
        currentValue = this.argument.evaluate(score);
      } catch (err) {
        throw String(err);
      }

      if (typeof currentValue !== "number") {
        throw new BaseError("Update expression only work on number", {
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
          throw new BaseError(`Unrecognized operator ${this.operator}`, {
            files: score.get("import").paths,
          });
      }

      score.update(this.argument.value, nextValue);

      return currentValue;
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

export { UpdateExpression };
