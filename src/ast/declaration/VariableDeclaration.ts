import { StmtType } from "../StmtType";
import { type Position } from "../../lexer/Position";
import { FunctionExpression } from "../expression/FunctionExpression";
import { Environment, type IOptionsVar } from "../../Environment";

class VariableDeclaration extends StmtType {
  public readonly name: string;
  public readonly value: StmtType;
  public readonly options: IOptionsVar;
  public readonly position: Position;

  constructor(
    name: string,
    value: StmtType,
    options: IOptionsVar,
    position: Position,
  ) {
    super();

    this.name = name;

    this.value = value;

    this.options = options;

    this.position = position;
  }

  evaluate(score: Environment) {
    if (this.value instanceof FunctionExpression) {
      this.value.name = this.name;
    }

    score.create(this.name, this.value.evaluate(score), this.options);

    return score.get(this.name);
  }
}

export { VariableDeclaration };
