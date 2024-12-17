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

  override evaluate(score: Environment): any {
    const obj = this.obj.evaluate(score);

    const objRef = this.property.evaluate(score);

    if (objRef instanceof StmtType) {
      return obj[objRef.evaluate(score)];
    }

    return obj[objRef];
  }
}

export { MemberExpression };
