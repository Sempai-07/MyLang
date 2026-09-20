import { StmtType } from "../StmtType";
import { type Position } from "../../lexer/token/Position";
import { IdentifierLiteral } from "../types/IdentifierLiteral";
import { FunctionExpression } from "../expression/FunctionExpression";
import { StructExpression } from "../expression/StructExpression";
import { Environment, type IOptionsVar } from "../../Environment";
import { AssignmentError, AssignmentCodeError } from "../../errors/runtime/AssignmentError";
import { isTypeArgs } from "../../../library/utils/utils";

class CombinedVariableDeclaration extends StmtType {
  public readonly value: {
    name: string;
    value: StmtType;
    options?: IOptionsVar;
  }[];
  public readonly iterableValue: StmtType | null;
  public readonly everyOptions: IOptionsVar | null;
  public readonly position: Position;

  constructor(
    value: { name: string; value: StmtType; options?: IOptionsVar }[],
    iterableValue: StmtType | null,
    everyOptions: IOptionsVar | null,
    position: Position,
  ) {
    super();

    this.value = value;

    this.iterableValue = iterableValue;

    this.everyOptions = everyOptions;

    this.position = position;
  }

  async evaluate(score: Environment) {
    let iterableValue: any[] = [];

    if (this.iterableValue) {
      const iterable = await this.iterableValue.evaluate(score);

      if (Environment.SymbolIterator in (iterable || {})) {
        if (isTypeArgs(iterable?.[Environment.SymbolIterator]) !== "function") {
          throw this.throwErrorFormatters(
            new Error(
              `<iter.symbol> expected function. Received ${isTypeArgs(iterable?.[Environment.SymbolIterator])}`,
            ),
            score,
          );
        }

        const iterator = await iterable[Environment.SymbolIterator].call(
          [{ value: iterable }],
          iterable,
        );

        if (isTypeArgs(iterator?.next) !== "function") {
          throw this.throwErrorFormatters(
            new Error(
              `<iter.symbol> the function must return a <next> function. Received ${isTypeArgs(iterator?.next)}`,
            ),
            score,
          );
        }

        let result = await (super.isNodeFunction(iterator.next)
          ? iterator.next.call([], iterable)
          : new iterator.next().call());

        while (!result?.done) {
          const value = result?.value;

          iterableValue.push(value);

          result = await (super.isNodeFunction(iterator.next)
            ? iterator.next.call([], iterable)
            : new iterator.next().call());
        }
      } else if (Symbol.iterator in iterable || Symbol.asyncIterator in iterable) {
        for await (const value of iterable) {
          iterableValue.push(value);
        }
      } else if (isTypeArgs(iterable) === "object") {
        iterableValue = iterable?.[Symbol.iterator] ? iterable : Object.keys(iterable);
      } else {
        throw super.throwErrorFormatters(
          new Error(`<${isTypeArgs(iterable)}> is not iterable`),
          score,
        );
      }

      for (let i = 0; i < this.value.length; i++) {
        const currentItem = this.value[i];
        if (!currentItem) continue;

        currentItem.value = iterableValue?.[i] ?? currentItem.value;
        const { name, value, options } = currentItem;

        if (value instanceof FunctionExpression || value instanceof StructExpression) {
          value.name = name;
        }

        if (value instanceof IdentifierLiteral && score.optionsVar[value.value]?.readonly) {
          if (options && score.optionsVar[value.value]) {
            throw new AssignmentError(AssignmentCodeError.AssignmentVarReadonlyOrConst, {
              name,
              files: score.get("import").paths,
            });
          }
        }

        const content = value instanceof StmtType ? await value.evaluate(score) : value;
        score.create(name, content, options);
      }

      return;
    }

    for (const { name, value, options } of this.value) {
      if (value instanceof FunctionExpression || value instanceof StructExpression) {
        value.name = name;
      }

      if (value instanceof IdentifierLiteral && score.optionsVar[value.value]?.readonly) {
        if (options && score.optionsVar[value.value]) {
          throw new AssignmentError(AssignmentCodeError.AssignmentVarReadonlyOrConst, {
            name,
            files: score.get("import").paths,
          });
        }
      }

      if (this.everyOptions) {
        if (this.everyOptions?.lazy) {
          score.create(name, value, this.everyOptions);
          return;
        }
        const content = await value.evaluate(score);
        score.create(name, content, this.everyOptions);
        return;
      }

      const content = await value.evaluate(score);
      score.create(name, content, options);
    }
  }
}

export { CombinedVariableDeclaration };
