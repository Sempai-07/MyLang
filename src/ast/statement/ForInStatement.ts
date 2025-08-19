import { StmtType } from "../StmtType";
import { type Position } from "../../lexer/token/Position";
import { Environment } from "../../Environment";
import { type BlockStatement } from "./BlockStatement";
import { VariableDeclaration } from "../declaration/VariableDeclaration";
import { IdentifierLiteral } from "../types/IdentifierLiteral";
import { BaseError } from "../../errors/BaseError";
import { runtime } from "../../runtime/Runtime";
import { isTypeArgs } from "../../../library/utils/utils";

class ForInStatement extends StmtType {
  public readonly variable: StmtType;
  public readonly iterable: StmtType;
  public readonly body: BlockStatement;
  public readonly position: Position;

  constructor(variable: StmtType, iterable: StmtType, body: BlockStatement, position: Position) {
    super();

    this.variable = variable;

    this.iterable = iterable;

    this.body = body;

    this.position = position;
  }

  async evaluate(score: Environment) {
    try {
      runtime.markIterationCallPosition();
      const bridgeEnvironment = new Environment(score);

      await this.variable.evaluate(bridgeEnvironment);
      let variable: string | null = null;

      if (this.variable instanceof VariableDeclaration) {
        variable = this.variable.name;
      } else if (this.variable instanceof IdentifierLiteral) {
        variable = this.variable.value;
      }

      if (!variable) {
        throw new BaseError("Expected a variable or identifier");
      }

      const iterable = await this.iterable.evaluate(bridgeEnvironment);

      if (Environment.SymbolIterator in (iterable || {})) {
        if (isTypeArgs(iterable?.[Environment.SymbolIterator]) !== "function") {
          throw new BaseError(
            `<iter.symbol> expected function. Received ${isTypeArgs(iterable?.[Environment.SymbolIterator])}`,
          );
        }

        const iterator = await iterable[Environment.SymbolIterator].call(
          [{ value: iterable }],
          iterable,
        );

        if (isTypeArgs(iterator?.next) !== "function") {
          throw new BaseError(
            `<iter.symbol> the function must return a <next> function. Received ${isTypeArgs(iterator?.next)}`,
          );
        }

        let result = await (super.isNodeFunction(iterator.next)
          ? iterator.next.call([], iterable)
          : new iterator.next().call());

        while (!result?.done) {
          const value = result?.value;

          if (runtime.isBreak || runtime.isReturn) break;

          bridgeEnvironment.ensure(variable, value);

          await this.body.evaluate(new Environment(bridgeEnvironment));

          result = await (super.isNodeFunction(iterator.next)
            ? iterator.next.call([], iterable)
            : new iterator.next().call());
        }
      } else if (Symbol.iterator in iterable || Symbol.asyncIterator in iterable) {
        for await (const value of iterable) {
          if (runtime.isBreak || runtime.isReturn) break;

          bridgeEnvironment.ensure(variable, value);

          await this.body.evaluate(new Environment(bridgeEnvironment));
        }
      } else if (isTypeArgs(iterable) === "object") {
        for (const key of iterable?.[Symbol.iterator] ? iterable : Object.keys(iterable)) {
          if (runtime.isBreak || runtime.isReturn) break;

          bridgeEnvironment.update(variable, key);

          await this.body.evaluate(new Environment(bridgeEnvironment));
        }
      } else {
        throw new BaseError(`<${isTypeArgs(iterable)}> is not iterable`);
      }

      runtime.resetBreak();
      runtime.finishIteration();
    } catch (err) {
      console.log(err);
      throw super.throwErrorFormatters(err, score);
    }
  }
}

export { ForInStatement };
