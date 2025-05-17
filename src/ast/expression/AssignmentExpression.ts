import { StmtType } from "../StmtType";
import { TokenType } from "../../lexer/TokenType";
import { type Position } from "../../lexer/Position";
import { AssignmentError } from "../../errors/BaseError";
import { IdentifierLiteral } from "../types/IdentifierLiteral";
import { MemberExpression } from "../expression/MemberExpression";
import { FunctionExpression } from "../expression/FunctionExpression";
import { BaseError } from "../../errors/BaseError";
import { Environment } from "../../Environment";

class AssignmentExpression extends StmtType {
  public readonly left: StmtType;
  public readonly right: StmtType;
  public readonly assignType: TokenType;
  public readonly position: Position;

  constructor(
    left: StmtType,
    assignType: TokenType,
    right: StmtType,
    position: Position,
  ) {
    super();

    this.left = left;

    this.assignType = assignType;

    this.right = right;

    this.position = position;
  }

  evaluate(score: Environment) {
    try {
      if (
        !(this.left instanceof IdentifierLiteral) &&
        !(this.left instanceof MemberExpression)
      ) {
        throw new AssignmentError(
          "left-hand must be identifer or member access expression",
          {
            code: "ASSIGNMENT_INVALID_TYPE",
            files: score.get("import").paths,
          },
        );
      }

      if (this.left instanceof IdentifierLiteral) {
        if (this.left.evaluate(score)?.[Environment.SymbolEnum]) {
          throw new AssignmentError(
            `Cannot assign to '${this.left.value}' because it is an enum`,
            {
              code: "ASSIGNMENT_ENUM_CONST",
              files: score.get("import").paths,
            },
          );
        } else if (score.optionsVar[this.left.value]?.constant) {
          throw new AssignmentError(
            `Assignment to '${this.left.value}' constant variable`,
            {
              code: "ASSIGNMENT_VAR_CONST",
              files: score.get("import").paths,
            },
          );
        }

        const rightValue = this.right.evaluate(score);

        switch (this.assignType) {
          case TokenType.OperatorAssign:
            if (rightValue instanceof FunctionExpression) {
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
            score.update(
              this.left.value,
              this.left.evaluate(score) + rightValue,
            );
            break;
          case TokenType.OperatorAssignMinus:
            score.update(
              this.left.value,
              this.left.evaluate(score) - rightValue,
            );
            break;
          default:
            throw new AssignmentError(`Invalid Operator: ${this.assignType}`, {
              code: "ASSIGNMENT_INVALID_OPERATOR",
              files: score.get("import").paths,
            });
        }
      } else if (this.left instanceof MemberExpression) {
        const value = this.left.obj.evaluate(score);

        if (
          value?.[Environment.SymbolEnum] ||
          score.optionsVar[
            (this.left.obj as unknown as { value: string }).value
          ]?.readonly
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
            throw new AssignmentError(
              `Index signature in type '${property}' only permits reading`,
              {
                code: "ASSIGNMENT_VAR_READONLY",
                files: score.get("import").paths,
              },
            );
          } else {
            throw new AssignmentError(
              `Cannot assign to '${property}' because it is a read-only property`,
              {
                code: "ASSIGNMENT_VAR_READONLY",
                files: score.get("import").paths,
              },
            );
          }
        }

        try {
          switch (this.assignType) {
            case TokenType.OperatorAssign: {
              value[this.left.property.evaluate(score)] =
                this.right.evaluate(score);
              break;
            }
            case TokenType.OperatorAssignPlus:
              value[this.left.property.evaluate(score)] +=
                this.right.evaluate(score);
              break;
            case TokenType.OperatorAssignMinus:
              value[this.left.property.evaluate(score)] -=
                this.right.evaluate(score);
              break;
          }
        } catch (err) {
          throw new AssignmentError(`Invalid: ${err}`, {
            code: "ASSIGNMENT_INVALID",
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

export { AssignmentExpression };
