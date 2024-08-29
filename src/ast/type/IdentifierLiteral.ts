import { Stmt } from "../Stmt";
import type { Position } from "../../lexer/Token";

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
      throw new Error(`Invalid identity ${this.name}`);
    }

    const result = score[this.name]?.evaluate?.(score);

    if (result) {
      return result;
    }

    return score[this.name];
  }
}

export { IdentifierLiteral };
