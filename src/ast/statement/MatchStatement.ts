import { deepEqual } from "node:assert";
import { StmtType } from "../StmtType";
import { type Position } from "../../lexer/token/Position";
import { Environment } from "../../Environment";
import { BlockStatement } from "./BlockStatement";
import { ReturnStatement } from "./ReturnStatement";
import { ObjectExpression } from "../expression/ObjectExpression";
import { MemberExpression } from "../expression/MemberExpression";
import { CallExpression } from "../expression/CallExpression";
import { isTypeArgs } from "../../../library/utils/utils";
import { runtime } from "../../runtime/Runtime";

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

  async evaluate(score: Environment) {
    try {
      let isMatchTry = false;
      const test = await this.test.evaluate(score);

      for (const { condition, block } of this.cases) {
        if (runtime.isReturn || runtime.isBreak) break;

        const conditionEvaluate = await condition.evaluate(score);
        if (
          ((this.test instanceof ObjectExpression || isTypeArgs(test) === "object") &&
            (condition instanceof MemberExpression || condition instanceof CallExpression) &&
            conditionEvaluate) ||
          deepEqualTry(test, conditionEvaluate)
        ) {
          isMatchTry = true;
          if (block instanceof BlockStatement) {
            const matchEnvironment = new Environment(score);
            await block.evaluate(matchEnvironment);
            const result = runtime.getLastExecutionResult();
            runtime.resetLastExecutionResult();
            return result;
          } else if (block instanceof ReturnStatement) {
            const evaluate = await block.evaluate(score);
            // @ts-ignore
            runtime._isReturn = true;
            // @ts-ignore
            runtime._lastExecutionResult = evaluate;
            return evaluate;
          } else return block.evaluate(score);
        }
      }

      if (this.defaultCase && !isMatchTry) {
        if (this.defaultCase instanceof BlockStatement) {
          const matchEnvironment = new Environment(score);
          await this.defaultCase.evaluate(matchEnvironment);
          const result = runtime.getLastExecutionResult();
          runtime.resetLastExecutionResult();
          return result;
        } else if (this.defaultCase instanceof ReturnStatement) {
          const evaluate = await this.defaultCase.evaluate(score);
          // @ts-ignore
          runtime._isReturn = true;
          // @ts-ignore
          runtime._lastExecutionResult = evaluate;
          return evaluate;
        } else return this.defaultCase.evaluate(score);
      }

      return null;
    } catch (err) {
      throw super.throwErrorFormatters(err, score);
    }
  }
}

export { MatchStatement };
