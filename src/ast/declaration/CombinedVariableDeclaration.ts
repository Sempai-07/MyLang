import { StmtType } from "../StmtType";
import { type Position } from "../../lexer/token/Position";
import { IdentifierLiteral } from "../types/IdentifierLiteral";
import { FunctionExpression } from "../expression/FunctionExpression";
import { StructExpression } from "../expression/StructExpression";
import { Environment, type IOptionsVar } from "../../Environment";
import { AssignmentError, AssignmentCodeError } from "../../errors/runtime/AssignmentError";

class CombinedVariableDeclaration extends StmtType {
  public readonly value: {
    name: string;
    value: StmtType;
    options?: IOptionsVar;
  }[];
  public readonly everyOptions: IOptionsVar | null;
  public readonly position: Position;

  constructor(
    value: { name: string; value: StmtType; options?: IOptionsVar }[],
    everyOptions: IOptionsVar | null,
    position: Position,
  ) {
    super();

    this.value = value;

    this.everyOptions = everyOptions;

    this.position = position;
  }

  async evaluate(score: Environment) {
    for (const { name, value, options } of this.value) {
      if (value instanceof FunctionExpression || value instanceof StructExpression) {
        value.name = name;
      }

      if (value instanceof IdentifierLiteral && score.optionsVar[value.value]?.readonly) {
        if (options && score.optionsVar[value.value]) {
          throw new AssignmentError(AssignmentCodeError.AssignmentVarReadonlyOrConst, {
            name,
            files: score.get("import").paths,
          });
        }
      }

      if (this.everyOptions) {
        if (this.everyOptions?.lazy) {
          score.create(name, value, this.everyOptions);
          return;
        }
        const content = await value.evaluate(score);
        score.create(name, content, this.everyOptions);
        return;
      }

      const content = await value.evaluate(score);
      score.create(name, content, options);
    }
  }
}

export { CombinedVariableDeclaration };
