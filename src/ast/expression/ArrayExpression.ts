import { StmtType } from "../StmtType";
import { type Position } from "../../lexer/token/Position";
import { type Environment } from "../../Environment";

class ArrayExpression extends StmtType {
  public readonly elements: StmtType[];
  public readonly position: Position;

  constructor(elements: StmtType[], position: Position) {
    super();

    this.elements = elements;

    this.position = position;
  }

  evaluate(score: Environment) {
    let index = 0;
    const result = [];

    for (const element of this.elements) {
      try {
        result.push(element.evaluate(score));
      } catch (err) {
        throw super.throwErrorFormatters(err, score, { index });
      }
      index++;
    }

    return result;
  }
}

export { ArrayExpression };
