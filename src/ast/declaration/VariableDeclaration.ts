import { StmtType } from "../StmtType";
import { type Position } from "../../lexer/token/Position";
import { IdentifierLiteral } from "../types/IdentifierLiteral";
import { FunctionExpression } from "../expression/FunctionExpression";
import { StructExpression } from "../expression/StructExpression";
import { Environment, type IOptionsVar } from "../../Environment";
import { AssignmentError, AssignmentCodeError } from "../../errors/runtime/AssignmentError";

class VariableDeclaration extends StmtType {
  public readonly name: string;
  public readonly value: StmtType;
  public readonly options: IOptionsVar | null;
  public readonly position: Position;

  constructor(name: string, value: StmtType, options: IOptionsVar | null, position: Position) {
    super();

    this.name = name;

    this.value = value;

    this.options = options;

    this.position = position;
  }

  async evaluate(score: Environment) {
    if (this.value instanceof FunctionExpression || this.value instanceof StructExpression) {
      this.value.name = this.name;
    }

    if (this.value instanceof IdentifierLiteral && score.optionsVar[this.value.value]?.readonly) {
      if (this.options && score.optionsVar[this.value.value]) {
        throw new AssignmentError(AssignmentCodeError.AssignmentVarReadonlyOrConst, {
          files: score.get("import").paths,
        });
      }

      score.create(this.name, await this.value.evaluate(score), {
        ...score.optionsVar[this.value.value],
        constant: false,
      });
    } else {
      score.create(this.name, await this.value.evaluate(score), this.options!);
    }

    return score.get(this.name);
  }
}

export { VariableDeclaration };
