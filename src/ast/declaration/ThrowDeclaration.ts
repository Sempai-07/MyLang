import { StmtType } from "../StmtType";
import { Environment } from "../../Environment";
import { BaseError } from "../../errors/BaseError";
import { type Position } from "../../lexer/Position";

class ThrowDeclaration extends StmtType {
  public readonly value: StmtType;
  public readonly position: Position;

  constructor(value: StmtType, position: Position) {
    super();

    this.value = value;

    this.position = position;
  }

  evaluate(score: Environment) {
    const err = this.value.evaluate(score);
    if (err instanceof BaseError) {
      throw err;
    }
    throw new BaseError(err, {
      files: [
        `throw (${score.get("import").main}:${this.position.line}:${this.position.column})`,
      ],
    });
  }
}

export { ThrowDeclaration };
