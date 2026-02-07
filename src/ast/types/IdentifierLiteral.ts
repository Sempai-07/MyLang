import { StmtType } from "../StmtType";
import { type Position } from "../../lexer/token/Position";
import { Environment } from "../../Environment";

class IdentifierLiteral extends StmtType {
  public readonly value: string;
  public readonly position: Position;

  constructor(value: string, position: Position) {
    super();

    this.value = value;

    this.position = position;
  }

  async evaluate(score: Environment) {
    try {
      if (score.optionsVar[this.value]?.lazy) {
        return await score.get(this.value)?.evaluate(score);
      }
      return score.get(this.value);
    } catch (err) {
      throw this.throwErrorFormatters(err, score);
    }
  }
}

export { IdentifierLiteral };
