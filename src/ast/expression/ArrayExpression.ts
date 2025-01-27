import { StmtType } from "../StmtType";
import { type Position } from "../../lexer/Position";
import { type Environment } from "../../Environment";
import { BaseError } from "../../errors/BaseError";

class ArrayExpression extends StmtType {
  public readonly elements: StmtType[];
  public readonly position: Position;

  constructor(elements: StmtType[], position: Position) {
    super();

    this.elements = elements;

    this.position = position;
  }

  evaluate(score: Environment) {
    try {
      const result = [];
      for (let element of this.elements) {
        result.push(element.evaluate(score));
      }
      return result;
    } catch (err) {
      if (err instanceof BaseError) {
        err.files = Array.from(
          new Set([score.get("import").main, ...err.files]),
        ).map((file) => {
          if (file === score.get("import").main) {
            return `Array(${file}:${this.position.line}:${this.position.column})`;
          }
          return file;
        });
      }
      throw err;
    }
  }
}

export { ArrayExpression };
