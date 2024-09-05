import { Stmt } from "../Stmt";
import type { Position } from "../../lexer/Token";
import { TypeError, TypeCodeError } from "../../errors/TypeError";

class IdentifierLiteral extends Stmt {
  public readonly name: string;
  public readonly position: Position;

  constructor(name: string, position: Position) {
    super();

    this.name = name;

    this.position = position;
  }

  override evaluate(score: Record<string, any>) {
    if (!(this.name in score)) {
      throw new TypeError(TypeCodeError.InvalidIdentifier, {
        value: this.identifier,
      }).genereteMessage(score.import.paths, this.position);
    }

    if (score[this.name] instanceof Stmt) {
      return score[this.name].evaluate(score);
    }

    if (score[this.name]?.value instanceof Stmt) {
      return score[this.name].value.evaluate(score);
    }

    return score[this.name]?.value || score[this.name];
  }
}

export { IdentifierLiteral };
