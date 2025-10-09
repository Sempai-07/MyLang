import { StmtType } from "../StmtType";
import { type Position } from "../../lexer/token/Position";
import { ReflectType } from "../../lexer/token/TokenType";
import { Environment } from "../../Environment";
import { IdentifierLiteral } from "../types/IdentifierLiteral";
import { OperatorError, OperatorCodeError } from "../../errors/runtime/OperatorError";
import { isTypeArgs } from "../../../library/utils/utils";

class ReflectionExpression extends StmtType {
  public readonly operator: ReflectType;
  public readonly left: StmtType | null;
  public readonly right: StmtType;
  public readonly position: Position;

  constructor(operator: ReflectType, left: StmtType | null, right: StmtType, position: Position) {
    super();

    this.operator = operator;

    this.left = left;

    this.right = right;

    this.position = position;
  }

  async evaluate(score: Environment) {
    try {
      switch (this.operator) {
        case ReflectType.In: {
          const leftValue = await this.left!.evaluate(score);
          const rightValue = await this.right.evaluate(score);
          const usedValueType = isTypeArgs(rightValue);

          if (!["error", "struct", "enum", "object", "array", "string"].includes(usedValueType)) {
            throw new OperatorError(OperatorCodeError.OperatorNotUsedType, {
              key: leftValue,
              notUsedType: usedValueType,
              files: score.get("import").paths,
            });
          }
          

          if (usedValueType === "string") {
            return leftValue <= rightValue.length - 1;
          }

          return leftValue in rightValue;
        }
        case ReflectType.Typeof: {
          try {
            const rightValue = await this.right.evaluate(score);
            return isTypeArgs(rightValue);
          } catch (err) {
            if (!(this.right instanceof IdentifierLiteral)) {
              throw err;
            }
            return "nil";
          }
        }
        default: {
          throw new OperatorError(OperatorCodeError.UnknownReflectOperator, {
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

export { ReflectionExpression };
