import { Stmt } from "../Stmt";
import type { Position } from "../../lexer/Token";
import type { BlockStatement } from "../expression/BlockStatement";
import type { IdentifierLiteral } from "../type/IdentifierLiteral";

class FunctionDeclaration extends Stmt {
  public readonly name: string;
  public readonly params: IdentifierLiteral[];
  public readonly body: BlockStatement;
  public readonly position: Position;

  constructor(
    name: string,
    params: IdentifierLiteral[],
    body: BlockStatement,
    position: Position,
  ) {
    super();

    this.name = name;

    this.params = params;

    this.body = body;

    this.position = position;
  }

  override evaluate(score: Record<string, any>) {
    score[this.name] = this;
    return this;
  }
}

export { FunctionDeclaration };