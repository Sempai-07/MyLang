import { StmtType } from "../StmtType";
import { type Position } from "../../lexer/Position";
import { IdentifierLiteral } from "../types/IdentifierLiteral";
import { FunctionExpression } from "../expression/FunctionExpression";
import { Environment, type IOptionsVar } from "../../Environment";
import { AssignmentError } from "../../errors/BaseError";

class CombinedVariableDeclaration extends StmtType {
  public readonly value: {
    name: string;
    value: StmtType;
    options?: IOptionsVar;
  }[];
  public readonly options: IOptionsVar | null;
  public readonly position: Position;

  constructor(
    value: { name: string; value: StmtType; options?: IOptionsVar }[],
    options: IOptionsVar | null,
    position: Position,
  ) {
    super();

    this.value = value;

    this.options = options;

    this.position = position;
  }

  evaluate(score: Environment) {
    for (const { name, value, options } of this.value) {
      if (value instanceof FunctionExpression) {
        value.name = name;
      }

      if (
        value instanceof IdentifierLiteral &&
        score.optionsVar[value.value]?.readonly
      ) {
        if (options && score.optionsVar[value.value]) {
          throw new AssignmentError(
            `Cannot assign const or readonly to variable "${value.value}" because it is already const/readonly`,
            {
              code: "ASSIGNMENT_VAR_READONLY_OR_CONST",
              files: score.get("import").paths,
            },
          );
        }
      }

      if (this.options) {
        score.create(name, value.evaluate(score), this.options);
      } else {
        score.create(name, value.evaluate(score), options);
      }
    }
  }
}

export { CombinedVariableDeclaration };
