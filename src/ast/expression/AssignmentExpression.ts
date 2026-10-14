import { StmtType } from "../StmtType";
import { TokenType } from "../../lexer/token/TokenType";
import { type Position } from "../../lexer/token/Position";
import { AssignmentError, AssignmentCodeError } from "../../errors/runtime/AssignmentError";
import { IdentifierLiteral } from "../types/IdentifierLiteral";
import { MemberExpression } from "../expression/MemberExpression";
import { FunctionExpression } from "../expression/FunctionExpression";
import { StructExpression } from "../expression/StructExpression";
import { FunctionDeclaration } from "../declaration/FunctionDeclaration";
import { StructDeclaration } from "../declaration/StructDeclaration";
import { Environment } from "../../Environment";

class AssignmentExpression extends StmtType {
  public readonly left: StmtType;
  public readonly right: StmtType;
  public readonly assignType: TokenType;
  public readonly position: Position;

  constructor(left: StmtType, assignType: TokenType, right: StmtType, position: Position) {
    super();

    this.left = left;

    this.assignType = assignType;

    this.right = right;

    this.position = position;
  }

  async evaluate(score: Environment) {
    try {
      if (!(this.left instanceof IdentifierLiteral) && !(this.left instanceof MemberExpression)) {
        throw new AssignmentError(AssignmentCodeError.AssignmentInvalidType, {
          files: score.get("import").paths,
        });
      }

      if (this.left instanceof IdentifierLiteral) {
        const leftValue = await this.left.evaluate(score);

        if (leftValue?.[Environment.SymbolEnum]) {
          throw new AssignmentError(AssignmentCodeError.AssignmentEnumConst, {
            name: this.left.value,
            files: score.get("import").paths,
          });
        } else if (leftValue instanceof StructDeclaration) {
          throw new AssignmentError(AssignmentCodeError.AssignmentStructData, {
            name: this.left.value,
            files: score.get("import").paths,
          });
        } else if (score.optionsVar[this.left.value]?.constant) {
          throw new AssignmentError(AssignmentCodeError.AssignmentVarConst, {
            name: this.left.value,
            files: score.get("import").paths,
          });
        }

        const rightValue = await this.right.evaluate(score);

        switch (this.assignType) {
          case TokenType.OperatorAssign:
            if (
              rightValue instanceof FunctionExpression ||
              rightValue instanceof StructExpression
            ) {
              rightValue.name = this.left.value;
            }

            if (this.right instanceof IdentifierLiteral) {
              return score.update(this.left.value, rightValue, {
                ...score.optionsVar[this.right.value],
                constant: false,
              });
            }

            return score.update(this.left.value, rightValue, {
              constant: false,
              readonly: false,
            });
          case TokenType.OperatorAssignPlus:
            return score.update(this.left.value, leftValue + rightValue);
          case TokenType.OperatorAssignMinus:
            return score.update(this.left.value, leftValue - rightValue);
          case TokenType.OperatorAssignMultiply:
            return score.update(this.left.value, leftValue * rightValue);
          case TokenType.OperatorAssignDivide:
            return score.update(this.left.value, leftValue / rightValue);
          case TokenType.OperatorAssignModule:
            return score.update(this.left.value, leftValue % rightValue);
          case TokenType.OperatorAssignPow:
            return score.update(this.left.value, leftValue ** rightValue);
          case TokenType.OperatorAndAssign:
            return score.update(this.left.value, leftValue && rightValue);
          case TokenType.OperatorOrAssign:
            return score.update(this.left.value, leftValue || rightValue);
          case TokenType.OperatorBitAndAssign:
            return score.update(this.left.value, leftValue & rightValue);
          case TokenType.OperatorBitOrAssign:
            return score.update(this.left.value, leftValue | rightValue);
          case TokenType.OperatorBitXorAssign:
            return score.update(this.left.value, leftValue ^ rightValue);
          case TokenType.OperatorShiftLeftAssign:
            return score.update(this.left.value, leftValue << rightValue);
          case TokenType.OperatorShiftRightAssign:
            return score.update(this.left.value, leftValue >> rightValue);
          case TokenType.OperatorShiftRightZeroFillAssign:
            return score.update(this.left.value, leftValue >>> rightValue);
          default:
            throw new AssignmentError(AssignmentCodeError.AssignmentInvalidOperator, {
              assignType: this.assignType,
              files: score.get("import").paths,
            });
        }
      } else if (this.left instanceof MemberExpression) {
        const value = await this.left.obj.evaluate(score);

        if (
          value?.[Environment.SymbolEnum] ||
          score.optionsVar[(this.left.obj as unknown as { value: string }).value]?.readonly ||
          (value?.[Environment.SymbolStruct] &&
            value?.[Environment.SymbolStructData]?.[
              (this.left.property as unknown as { value: string }).value
            ]?.readonly)
        ) {
          const property =
            "value" in this.left.property
              ? (this.left.property as { value: string }).value
              : (
                  (<MemberExpression>this.left).obj as unknown as {
                    value: string;
                  }
                ).value;

          if (!Number.isNaN(Number(property))) {
            throw new AssignmentError(AssignmentCodeError.AssignmentIndexReadonly, {
              index: property,
              files: score.get("import").paths,
            });
          } else {
            throw new AssignmentError(AssignmentCodeError.AssignmentPropertyReadonly, {
              property,
              files: score.get("import").paths,
            });
          }
        }

        if (super.isStructData(value)) {
          if (this.assignType !== TokenType.OperatorAssign) {
            throw new AssignmentError(AssignmentCodeError.AssignmentStructDataOperatorInvalid, {
              name: value.name || "[anonymous struct]",
              files: score.get("import").paths,
            });
          }

          const rightValue = await this.right.evaluate(score);
          const leftValue = await this.left.property.evaluate(score);

          if (this.isNodeFunction(rightValue)) {
            if (rightValue instanceof FunctionExpression) {
              if (!rightValue.name) {
                if (typeof leftValue !== "string") {
                  throw new AssignmentError(AssignmentCodeError.AssignmentStructDataFunc, {
                    name: value.name,
                    files: score.get("import").paths,
                  });
                }
                rightValue.name = leftValue;
              }
            }
            value.methods.push(rightValue as FunctionDeclaration);
          }

          // @ts-ignore
          return (value[leftValue] = rightValue);
        }

        try {
          const leftValue = await this.left.property.evaluate(score);
          const rightValue = await this.right.evaluate(score);

          switch (this.assignType) {
            case TokenType.OperatorAssign: {
              return (value[leftValue] = rightValue);
            }
            case TokenType.OperatorAssignPlus:
              return (value[leftValue] += rightValue);
            case TokenType.OperatorAssignMinus:
              return (value[leftValue] -= rightValue);
            case TokenType.OperatorAssignMultiply:
              return (value[leftValue] *= rightValue);
            case TokenType.OperatorAssignDivide:
              return (value[leftValue] /= rightValue);
            case TokenType.OperatorAssignModule:
              return (value[leftValue] %= rightValue);
            case TokenType.OperatorAssignPow:
              return (value[leftValue] **= rightValue);
            case TokenType.OperatorAndAssign:
              return (value[leftValue] &&= rightValue);
            case TokenType.OperatorOrAssign:
              return (value[leftValue] ||= rightValue);
            case TokenType.OperatorBitAndAssign:
              return (value[leftValue] &= rightValue);
            case TokenType.OperatorBitOrAssign:
              return (value[leftValue] |= rightValue);
            case TokenType.OperatorBitXorAssign:
              return (value[leftValue] ^= rightValue);
            case TokenType.OperatorShiftLeftAssign:
              return (value[leftValue] <<= rightValue);
            case TokenType.OperatorShiftRightAssign:
              return (value[leftValue] >>= rightValue);
            case TokenType.OperatorShiftRightZeroFillAssign:
              return (value[leftValue] >>>= rightValue);
          }
        } catch (err) {
          throw new AssignmentError(AssignmentCodeError.AssignmentInvalid, {
            err,
            files: score.get("import").paths,
          });
        }
      }
    } catch (err) {
      throw super.throwErrorFormatters(err, score);
    }
  }
}

export { AssignmentExpression };
