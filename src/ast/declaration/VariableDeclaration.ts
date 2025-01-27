import { StmtType } from "../StmtType";
import { type Position } from "../../lexer/Position";
import { FunctionExpression } from "../expression/FunctionExpression";
import { Environment, type IOptionsVar } from "../../Environment";
import { BaseError } from "../../errors/BaseError";

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
    try {
      if (this.value instanceof FunctionExpression) {
        this.value.name = this.name;
      }

      score.create(this.name, this.value.evaluate(score), this.options);

      return score.get(this.name);
    } catch (err) {
      if (err instanceof BaseError) {
        err.files = Array.from(
          new Set([score.get("import").main, ...err.files]),
        ).map((file) => {
          if (file === score.get("import").main) {
            return `${file}:${this.position.line}:${this.position.column}`;
          }
          return file;
        });
      }
      throw err;
    }
  }
}

export { VariableDeclaration };
