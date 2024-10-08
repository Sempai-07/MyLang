import { Stmt } from "../Stmt";
import type { StmtType } from "../StmtType";
import type { Position } from "../../lexer/Token";

class MemberExpression extends Stmt {
  public readonly obj: StmtType;
  public readonly property: MemberExpression;
  public readonly position: Position;

  constructor(obj: StmtType, property: MemberExpression, position: Position) {
    super();

    this.obj = obj;

    this.property = property;

    this.position = position;
  }

  override evaluate(score: Record<string, any>) {
    const obj = this.obj.evaluate(score);

    const objRef = this.property.evaluate(score);

    if (objRef instanceof Stmt) {
      return obj[objRef.evaluate(score)];
    }

    return obj[objRef];
  }
}

export { MemberExpression };
