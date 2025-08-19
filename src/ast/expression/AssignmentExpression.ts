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
              score.update(this.left.value, rightValue, {
                ...score.optionsVar[this.right.value],
                constant: false,
              });
              break;
            }

            score.update(this.left.value, rightValue, {
              constant: false,
              readonly: false,
            });
            break;
          case TokenType.OperatorAssignPlus:
            score.update(this.left.value, leftValue + rightValue);
            break;
          case TokenType.OperatorAssignMinus:
            score.update(this.left.value, leftValue - rightValue);
            break;
          case TokenType.OperatorAssignMultiply:
            score.update(this.left.value, leftValue * rightValue);
            break;
          case TokenType.OperatorAssignDivide:
            score.update(this.left.value, leftValue / rightValue);
            break;
          case TokenType.OperatorAssignModule:
            score.update(this.left.value, leftValue % rightValue);
            break;
          case TokenType.OperatorAssignPow:
            score.update(this.left.value, leftValue ** rightValue);
            break;
          case TokenType.OperatorAndAssign:
            score.update(this.left.value, leftValue && rightValue);
            break;
          case TokenType.OperatorOrAssign:
            score.update(this.left.value, leftValue || rightValue);
            break;
          case TokenType.OperatorBitAndAssign:
            score.update(this.left.value, leftValue & rightValue);
            break;
          case TokenType.OperatorBitOrAssign:
            score.update(this.left.value, leftValue | rightValue);
            break;
          case TokenType.OperatorBitXorAssign:
            score.update(this.left.value, leftValue ^ rightValue);
            break;
          case TokenType.OperatorShiftLeftAssign:
            score.update(this.left.value, leftValue << rightValue);
            break;
          case TokenType.OperatorShiftRightAssign:
            score.update(this.left.value, leftValue >> rightValue);
            break;
          case TokenType.OperatorShiftRightZeroFillAssign:
            score.update(this.left.value, leftValue >>> rightValue);
            break;
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

        if (value instanceof StructDeclaration || value instanceof StructExpression) {
          if (this.assignType !== TokenType.OperatorAssign) {
            throw new AssignmentError(AssignmentCodeError.AssignmentStructDataOperatorInvalid, {
              name: value.name,
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
          value[leftValue] = rightValue;

          return;
        }

        try {
          const leftValue = await this.left.property.evaluate(score);
          const rightValue = await this.right.evaluate(score);

          switch (this.assignType) {
            case TokenType.OperatorAssign: {
              value[leftValue] = rightValue;
              break;
            }
            case TokenType.OperatorAssignPlus:
              value[leftValue] += rightValue;
              break;
            case TokenType.OperatorAssignMinus:
              value[leftValue] -= rightValue;
              break;
            case TokenType.OperatorAssignMultiply:
              value[leftValue] *= rightValue;
              break;
            case TokenType.OperatorAssignDivide:
              value[leftValue] /= rightValue;
              break;
            case TokenType.OperatorAssignModule:
              value[leftValue] %= rightValue;
              break;
            case TokenType.OperatorAssignPow:
              value[leftValue] **= rightValue;
              break;
            case TokenType.OperatorAndAssign:
              value[leftValue] &&= rightValue;
              break;
            case TokenType.OperatorOrAssign:
              value[leftValue] ||= rightValue;
              break;
            case TokenType.OperatorBitAndAssign:
              value[leftValue] &= rightValue;
              break;
            case TokenType.OperatorBitOrAssign:
              value[leftValue] |= rightValue;
              break;
            case TokenType.OperatorBitXorAssign:
              value[leftValue] ^= rightValue;
              break;
            case TokenType.OperatorShiftLeftAssign:
              value[leftValue] <<= rightValue;
              break;
            case TokenType.OperatorShiftRightAssign:
              value[leftValue] >>= rightValue;
              break;
            case TokenType.OperatorShiftRightZeroFillAssign:
              value[leftValue] >>>= rightValue;
              break;
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
