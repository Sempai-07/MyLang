import { Stmt } from "../Stmt";
import type { StmtType } from "../StmtType";
import type { Position } from "../../lexer/Token";
import { FunctionDeclaration } from "../function/FunctionDeclaration";
import type { BinaryExpression } from "../expression/BinaryExpression";
import { NativeFunction } from "../../Environment";

class FunctionCall extends Stmt {
  public readonly name: string;
  public readonly argument: BinaryExpression[] | StmtType[];
  public readonly position: Position;

  constructor(
    name: string,
    argument: BinaryExpression[] | StmtType[],
    position: Position,
  ) {
    super();
    this.name = name;
    this.argument = argument;
    this.position = position;
  }

  override evaluate(score: Record<string, any>) {
    const func = score[this.name];

    if (!func) {
      throw new Error(`Invalid identity ${this.name}`);
    }

    if (func?.[NativeFunction]) {
      return func.func(score, ...this.argument);
    }

    const evaluatedFunc = func?.evaluate?.(score);

    if (typeof evaluatedFunc === "function") {
      const evaluatedArgs = this.argument.map((arg) =>
        arg.evaluate(score),
      ) as any[];
      return evaluatedFunc(evaluatedArgs, score);
    }

    return this.executeFunction(score, func);
  }

  executeFunction(score: Record<string, any>, func: FunctionDeclaration) {
    const localStore = { ...score };
    const evaluatedArgs = this.argument.map((arg) => arg.evaluate(localStore));

    if (!(func instanceof FunctionDeclaration)) {
      func = func.evaluate(localStore);
    }

    for (let i = 0; i < func.params.length; i++) {
      if (!evaluatedArgs[i] && func.params[i][1]!) {
        localStore[func.params[i][0]!] =
          func.params[i][1]!.evaluate(localStore);
        continue;
      }
      localStore[func.params[i][0]!] = evaluatedArgs[i];
    }

    return func.body.evaluate(localStore);
  }
}

export { FunctionCall };
