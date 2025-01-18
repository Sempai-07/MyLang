import { StmtType } from "../StmtType";
import { type Position } from "../../lexer/Position";
import { Environment } from "../../Environment";

class ExportsDeclaration extends StmtType {
  public readonly position: Position;
  public readonly value: string | Record<string, StmtType>;

  constructor(value: string | Record<string, StmtType>, position: Position) {
    super();

    this.value = value;

    this.position = position;
  }

  override evaluate(score: Environment) {
    for (const key of <string[]>Object.keys(this.value)) {
      score.update("#exports", {
        ...score.get("#exports"),
        // @ts-expect-error
        [key]: this.value[key].evaluate(score),
      });
    }

    return null;
  }
}

export { ExportsDeclaration };
