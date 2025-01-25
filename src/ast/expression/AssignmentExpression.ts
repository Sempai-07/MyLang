import { StmtType } from "../StmtType";
import { TokenType } from "../../lexer/TokenType";
import { type Position } from "../../lexer/Position";
import { IdentifierLiteral } from "../types/IdentifierLiteral";
import { MemberExpression } from "../expression/MemberExpression";
import { FunctionExpression } from "../expression/FunctionExpression";
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

    if (
      !(this.left instanceof IdentifierLiteral) &&
      !(this.left instanceof MemberExpression)
    ) {
      throw "left-hand must be identifer or member access expression";
    }
  }

  evaluate(score: Environment) {
    if (this.left instanceof IdentifierLiteral) {
      if (this.left.evaluate(score)?.[Environment.SymbolEnum]) {
        throw `Cannot assign to '${this.left.value}' because it is an enum`;
      } else if (score.optionsVar[this.left.value]?.constant) {
        throw `Assignment to '${this.left.value}' constant variable`;
      }

      const rightValue = this.right.evaluate(score);

      switch (this.assignType) {
        case TokenType.OperatorAssign:
          if (rightValue instanceof FunctionExpression) {
            rightValue.name = this.left.value;
          }
          score.update(this.left.value, rightValue);
          break;
        case TokenType.OperatorAssignPlus:
          score.update(this.left.value, this.left.evaluate(score) + rightValue);
          break;
        case TokenType.OperatorAssignMinus:
          score.update(this.left.value, this.left.evaluate(score) - rightValue);
          break;
        default:
          throw `Error Assignment Operator: ${this.assignType}`;
      }
    } else if (this.left instanceof MemberExpression) {
      const value = this.left.obj.evaluate(score);

      if (
        value?.[Environment.SymbolEnum] ||
        score.optionsVar[(this.left.obj as unknown as { value: string }).value]
          ?.readonly
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
          throw `Index signature in type '${property}' only permits reading`;
        } else {
          throw `Cannot assign to '${property}' because it is a read-only property`;
        }
      }

      try {
        switch (this.assignType) {
          case TokenType.OperatorAssign:
            value[this.left.property.evaluate(score)] =
              this.right.evaluate(score);
            break;
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
        throw `Error Assignment: ${err}`;
      }
    }
  }
}

export { AssignmentExpression };
