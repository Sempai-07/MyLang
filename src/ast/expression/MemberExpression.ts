import { StmtType } from "../StmtType";
import { type Position } from "../../lexer/Position";
import { Environment } from "../../Environment";
import { BaseError } from "../../errors/BaseError";

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
    try {
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

export { MemberExpression };
