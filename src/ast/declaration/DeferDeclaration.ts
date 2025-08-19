import { StmtType } from "../StmtType";
import { type Position } from "../../lexer/token/Position";
import { Environment } from "../../Environment";

class DeferDeclaration extends StmtType {
  public readonly value: StmtType;
  public readonly position: Position;

  constructor(value: StmtType, position: Position) {
    super();

    this.value = value;

    this.position = position;
  }

  async evaluate(score: Environment) {
    try {
      await this.value.evaluate(score);
    } catch (err) {
      throw super.throwErrorFormatters(err, score);
    }
  }
}

export { DeferDeclaration };
