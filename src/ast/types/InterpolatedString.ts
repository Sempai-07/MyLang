import { StmtType } from "../StmtType";
import { type Environment } from "../../Environment";
import { type Position } from "../../lexer/token/Position";
import { BaseError } from "../../errors/BaseError";

class InterpolatedString extends StmtType {
  public readonly value: string;
  public readonly interpolatedList: any[];
  public readonly position: Position;

  constructor(value: string, interpolatedList: any[], position: Position) {
    super();

    this.value = value;

    this.interpolatedList = interpolatedList;

    this.position = position;
  }

  async evaluate(score: Environment) {
    if (this.interpolatedList.length === 0) {
      return this.value;
    }

    try {
      const evaluatedValues: any[] = [];

      for (const tokens of this.interpolatedList) {
        if (tokens.errors.length > 0) {
          const errors = tokens.errors[0]!;
          throw super.throwErrorFormatters(new BaseError(errors.message), score);
        }

        const parseValue = new Parser(tokens.tokens).parse();
        evaluatedValues.push(await parseValue[0]!.evaluate(score));
      }

      return this.value.replace(/\{(\d+)\}/g, (_, index) => evaluatedValues[parseInt(index, 10)]);
    } catch (err) {
      throw super.throwErrorFormatters(err, score);
    }
  }
}

export { InterpolatedString };

import { Parser } from "../Parser";
