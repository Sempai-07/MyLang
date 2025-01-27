import { deepEqual } from "node:assert";
import { StmtType } from "../StmtType";
import { type Position } from "../../lexer/Position";
import { Environment } from "../../Environment";
import { BlockStatement } from "./BlockStatement";
import { runtime } from "../../runtime/Runtime";
import { BaseError } from "../../errors/BaseError";

function deepEqualTry(actual: unknown, expected: unknown) {
  try {
    deepEqual(actual, expected);
    return true;
  } catch {
    return false;
  }
}

class MatchStatement extends StmtType {
  public readonly test: StmtType;
  public readonly cases: { condition: StmtType; block: StmtType }[];
  public readonly defaultCase: StmtType | null;
  public readonly position: Position;

  constructor(
    test: StmtType,
    cases: { condition: StmtType; block: StmtType }[],
    defaultCase: StmtType | null,
    position: Position,
  ) {
    super();

    this.test = test;

    this.cases = cases;

    this.defaultCase = defaultCase;

    this.position = position;
  }

  evaluate(score: Environment) {
    try {
      let isMatchTry = false;
      const test = this.test.evaluate(score);

      for (const { condition, block } of this.cases) {
        if (runtime.isReturn) break;
        if (deepEqualTry(test, condition.evaluate(score))) {
          isMatchTry = true;
          if (block instanceof BlockStatement) {
            const matchEnvironment = new Environment(score);
            block.evaluate(matchEnvironment);
            continue;
          }
          block.evaluate(score);
        }
      }

      if (this.defaultCase && !isMatchTry) {
        if (this.defaultCase instanceof BlockStatement) {
          const matchEnvironment = new Environment(score);
          this.defaultCase.evaluate(matchEnvironment);
        } else this.defaultCase.evaluate(score);
      }

      return null;
    } catch (err) {
      if (err instanceof BaseError) {
        err.files = Array.from(
          new Set([score.get("import").main, ...err.files]),
        ).map((file) => {
          if (file === score.get("import").main) {
            return `Match (${file}:${this.position.line}:${this.position.column})`;
          }
          return file;
        });
      }
      throw err;
    }
  }
}

export { MatchStatement };
