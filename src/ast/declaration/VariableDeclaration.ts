import { StmtType } from "../StmtType";
import { type Position } from "../../lexer/Position";
import { IdentifierLiteral } from "../types/IdentifierLiteral";
import { FunctionExpression } from "../expression/FunctionExpression";
import { Environment, type IOptionsVar } from "../../Environment";
import { AssignmentError } from "../../errors/BaseError";

class VariableDeclaration extends StmtType {
  public readonly name: string;
  public readonly value: StmtType;
  public readonly options: IOptionsVar | null;
  public readonly position: Position;

  constructor(
    name: string,
    value: StmtType,
    options: IOptionsVar | null,
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

    if (
      this.value instanceof IdentifierLiteral &&
      score.optionsVar[this.value.value]?.readonly
    ) {
      if (this.options && score.optionsVar[this.value.value]) {
        throw new AssignmentError(
          `Cannot assign const or readonly to variable "${this.value.value}" because it is already const/readonly`,
          {
            code: "ASSIGNMENT_VAR_READONLY_OR_CONST",
            files: score.get("import").paths,
          },
        );
      }
      score.create(this.name, this.value.evaluate(score), {
        ...score.optionsVar[this.value.value],
        constant: false,
      });
    } else {
      score.create(this.name, this.value.evaluate(score), this.options!);
    }

    return score.get(this.name);
  }
}

export { VariableDeclaration };
