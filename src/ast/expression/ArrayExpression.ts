import { StmtType } from "../StmtType";
import { type Position } from "../../lexer/Position";
import { type Environment } from "../../Environment";

class ArrayExpression extends StmtType {
  public readonly elements: StmtType[];
  public readonly position: Position;

  constructor(elements: StmtType[], position: Position) {
    super();

    this.elements = elements;

    this.position = position;
  }

  override evaluate(score: Environment) {
    const result = [];
    for (let element of this.elements) {
      result.push(element.evaluate(score));
    }
    return result;
  }
}

export { ArrayExpression };
