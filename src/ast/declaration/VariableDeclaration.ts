import { StmtType } from "../StmtType";
import { type Position } from "../../lexer/Position";
import { FunctionExpression } from "../expression/FunctionExpression";
import { Environment } from "../../Environment";

class VariableDeclaration extends StmtType {
  public readonly name: string;
  public readonly value: StmtType;
  public readonly position: Position;

  constructor(name: string, value: StmtType, position: Position) {
    super();

    this.name = name;

    this.value = value;

    this.position = position;
  }

  override evaluate(score: Environment): any {
    score.create(this.name, this.value);

    if (this.value instanceof StmtType) {
      if (this.value instanceof FunctionExpression) {
        this.value.name = this.name;
      }
      score.update(this.name, this.value.evaluate(score));
      return score.get(this.name);
    }

    return score.get(this.name);
  }
}

export { VariableDeclaration };
