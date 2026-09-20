import { StmtType } from "../StmtType";
import { type Position } from "../../lexer/token/Position";
import { Environment } from "../../Environment";
import { BaseError } from "../../errors/BaseError";
import { FunctionExpression } from "./FunctionExpression";

class DeferExpression extends StmtType {
  public readonly value: StmtType;
  public readonly position: Position;

  constructor(value: StmtType, position: Position) {
    super();

    this.value = value;

    this.position = position;
  }

  async evaluate(score: Environment) {
    const result = await this.value.evaluate(score);

    if (!(Environment.SymbolDeferred in result)) {
      throw super.throwErrorFormatters(
        new BaseError('Defer expression must return a value with "symbol.diponse" property', {
          files: score.get("import").paths,
        }),
        score,
      );
    }

    const disposeSymbol = (
      result as unknown as { [Environment.SymbolDeferred]: FunctionExpression }
    )?.[Environment.SymbolDeferred];

    score.deferenceCall.push([
      score.clone(),
      (score: Environment) => disposeSymbol?.call([{ value: result }], score),
    ]);

    return result;
  }
}

export { DeferExpression };
