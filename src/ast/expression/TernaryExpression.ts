import { StmtType } from "../StmtType";
import { type Position } from "../../lexer/Position";
import { Environment } from "../../Environment";

class TernaryExpression extends StmtType {
  public readonly condition: StmtType;
  public readonly expressionIfTrue: StmtType;
  public readonly expressionIfFalse: StmtType;
  public readonly position: Position;

  constructor(
    condition: StmtType,
    expressionIfTrue: StmtType,
    expressionIfFalse: StmtType,
    position: Position,
  ) {
    super();

    this.condition = condition;

    this.expressionIfTrue = expressionIfTrue;

    this.expressionIfFalse = expressionIfFalse;

    this.position = position;
  }

  evaluate(score: Environment) {
    let condition: any = this.condition.evaluate(score);

    if (Array.isArray(condition)) {
      condition = condition.length;
    } else if (condition && typeof condition === "object") {
      condition = Object.keys(condition).length;
    }

    if (condition) {
      return this.expressionIfTrue.evaluate(score);
    }
    return this.expressionIfFalse.evaluate(score);
  }
}

export { TernaryExpression };
