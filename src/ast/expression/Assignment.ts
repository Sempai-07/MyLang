import { Stmt } from "../Stmt";
import type { StmtType } from "../StmtType";
import type { Position } from "../../lexer/Token";
import { TypeError, TypeCodeError } from "../../errors/TypeError";

class Assignment extends Stmt {
  public readonly variable: string;
  public readonly value: StmtType;
  public readonly position: Position;

  constructor(variable: string, value: StmtType, position: Position) {
    super();

    this.variable = variable;

    this.value = value;

    this.position = position;
  }

  override evaluate(score: Record<string, any>) {
    if (!(this.variable in score)) {
      throw new TypeError(TypeCodeError.InvalidIdentifier, {
        value: this.variable,
      }).genereteMessage(score.import.paths, this.position);
    }

    if (score[this.variable]?.constant) {
      throw new TypeError(TypeCodeError.AssignmentConstants, {
        variable: this.variable,
      }).genereteMessage(score.import.paths, this.position);
    }

    const result = this.value.evaluate(score);

    score[this.variable] = result;

    return result;
  }
}

export { Assignment };
