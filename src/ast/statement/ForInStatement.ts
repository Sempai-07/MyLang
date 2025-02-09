import { StmtType } from "../StmtType";
import { type Position } from "../../lexer/Position";
import { Environment } from "../../Environment";
import { type BlockStatement } from "./BlockStatement";
import { VariableDeclaration } from "../declaration/VariableDeclaration";
import { IdentifierLiteral } from "../types/IdentifierLiteral";
import { BaseError } from "../../errors/BaseError";
import { runtime } from "../../runtime/Runtime";
import { typeOf } from "../../native/lib/utils/index";
import { symbol } from "../../native/lib/iter/index";

class ForInStatement extends StmtType {
  public readonly variable: StmtType;
  public readonly iterable: StmtType;
  public readonly body: BlockStatement;
  public readonly position: Position;

  constructor(
    variable: StmtType,
    iterable: StmtType,
    body: BlockStatement,
    position: Position,
  ) {
    super();

    this.variable = variable;

    this.iterable = iterable;

    this.body = body;

    this.position = position;
  }

  evaluate(score: Environment) {
    try {
      runtime.markIterationCallPosition();
      const bridgeEnvironment = new Environment(score);

      this.variable.evaluate(bridgeEnvironment);
      let variable: string | null = null;

      if (this.variable instanceof VariableDeclaration) {
        variable = this.variable.name;
      } else if (this.variable instanceof IdentifierLiteral) {
        variable = this.variable.value;
      }

      if (!variable) {
        throw new BaseError("Expected a variable or identifier");
      }

      const iterable = this.iterable.evaluate(bridgeEnvironment);

      if (iterable?.[symbol]) {
        const iterator = iterable[symbol].call([iterable], iterable);
        let result = iterator.next();

        while (!result.done) {
          const value = result.value;

          if (runtime.isBreak || runtime.isReturn) break;

          bridgeEnvironment.ensure(variable, value);
          this.body.evaluate(new Environment(bridgeEnvironment));

          result = iterator.next();
        }
      } else if (typeOf([iterable]) === "array") {
        for (const value of iterable) {
          if (runtime.isBreak || runtime.isReturn) break;
          bridgeEnvironment.ensure(variable, value);
          this.body.evaluate(new Environment(bridgeEnvironment));
        }
      } else if (typeOf([iterable]) === "object") {
        for (const key of iterable?.[Symbol.iterator]
          ? iterable
          : Object.keys(iterable)) {
          if (runtime.isBreak || runtime.isReturn) break;
          bridgeEnvironment.update(variable, key);
          this.body.evaluate(new Environment(bridgeEnvironment));
        }
      } else {
        throw new BaseError(`${typeOf([iterable])} is not iterable`);
      }
      runtime.resetIsBreak();
    } catch (err) {
      if (err instanceof BaseError) {
        err.files = Array.from(
          new Set([score.get("import").main, ...err.files]),
        ).map((file) =>
          file === score.get("import").main
            ? `ForIn (${file}:${this.position.line}:${this.position.column})`
            : file,
        );
      }
      throw err;
    }
  }
}

export { ForInStatement };
