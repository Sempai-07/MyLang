import { StmtType, type ITextOptions } from "../StmtType";
import { type Position } from "../../lexer/token/Position";
import { IdentifierLiteral } from "../types/IdentifierLiteral";
import { Environment } from "../../Environment";
import { FunctionCallError, FunctionCallCodeError } from "../../errors/runtime/FunctionCallError";

class FunctionCall extends StmtType {
  public readonly name: string;
  public readonly argument: StmtType[];
  public readonly position: Position;

  constructor(name: string, argument: StmtType[], position: Position) {
    super();

    this.name = name;

    this.argument = argument;

    this.position = position;
  }

  async evaluate(score: Environment) {
    try {
      const func = score.get(this.name);

      if (super.isNodeFunction(func)) {
        const combinedScore = score.combine(func.parentEnv);
        const argument = [];
        for (const arg of this.argument) {
          const result = await arg.evaluate(combinedScore);

          if (arg instanceof IdentifierLiteral) {
            const variableOpts = combinedScore.optionsVar[arg.value];

            argument.push({
              ...(variableOpts && { options: variableOpts }),
              value: result,
            });
          } else {
            argument.push({ value: result });
          }
        }

        return func.call(argument);
      }

      if (super.isBuildModuleFunction(func)) {
        const argument = [];
        for (const arg of this.argument) {
          argument.push(await arg.evaluate(score));
        }

        return new func(argument, this.argument, score).call();
      }

      if (super.isStructData(func)) {
        const argument = [];
        for (const arg of this.argument) {
          argument.push(await arg.evaluate(score));
        }

        return func.call(argument);
      }

      throw new FunctionCallError(FunctionCallCodeError.FunctionCallUnknown, {
        name: this.name,
        files: score.get("import").paths,
      });
    } catch (err) {
      throw super.throwErrorFormatters(err, score, ({ file, position }: ITextOptions) => {
        return `${this.name} (${file}:${position.line}:${position.column})`;
      });
    }
  }
}

export { FunctionCall };
