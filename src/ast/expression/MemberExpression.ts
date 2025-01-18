import { StmtType } from "../StmtType";
import { type Position } from "../../lexer/Position";
import { Environment } from "../../Environment";

class MemberExpression extends StmtType {
  public readonly obj: StmtType;
  public readonly property: MemberExpression;
  public readonly position: Position;

  constructor(obj: StmtType, property: MemberExpression, position: Position) {
    super();

    this.obj = obj;

    this.property = property;

    this.position = position;
  }

  evaluate(score: Environment): any {
    const obj = this.obj.evaluate(score);

    const objRef = this.property.evaluate(score);

    if (objRef instanceof StmtType) {
      const index = objRef.evaluate(score);
      if (typeof index === "number") {
        return obj[index] === undefined ? null : obj[index];
      }
      return obj[index] === undefined ? null : obj[index];
    }

    if (typeof objRef === "number") {
      return obj[objRef] === undefined ? null : obj[objRef];
    }
    return obj[objRef] === undefined ? null : obj[objRef];
  }
}

export { MemberExpression };
