import { StmtType } from "../StmtType";
import { type Position } from "../../lexer/Position";
import { Environment } from "../../Environment";
import { IdentifierLiteral } from "../types/IdentifierLiteral";

const exportSymbol = Symbol("ExportSymbol");

class ExportsDeclaration extends StmtType {
  public readonly position: Position;
  public readonly value: string | Record<string, StmtType>;

  constructor(value: string | Record<string, StmtType>, position: Position) {
    super();

    this.value = value;

    this.position = position;
  }

  evaluate(score: Environment) {
    for (const key of <string[]>Object.keys(this.value)) {
      // @ts-ignore
      const expValue = this.value[key];

      score.update("#exports", {
        ...score.get("#exports"),
        [key]: {
          value: expValue.evaluate(score),
          ...(expValue instanceof IdentifierLiteral &&
            score.optionsVar[expValue.value] && {
              optionsVar: score.optionsVar[expValue.value],
            }),
          [exportSymbol]: true,
        },
      });
    }

    return null;
  }
}

export { ExportsDeclaration, exportSymbol };
