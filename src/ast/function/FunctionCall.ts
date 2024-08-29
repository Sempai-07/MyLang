import { Stmt } from "../Stmt";
import type { StmtType } from "../StmtType";
import type { Position } from "../../lexer/Token";
import type { FunctionDeclaration } from "../function/FunctionDeclaration";
import type { BinaryExpression } from "../expression/BinaryExpression";
import { NativeFunction } from "../../Interpreter";

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
    if (!(this.name in score)) {
      throw new Error(`Invalid identity ${this.name}`);
    }

    if (score[this.name]?.[NativeFunction]) {
      return score[this.name].func(score, ...this.argument);
    }

    const func = score[this.name];

    const localStore = { ...score };

    func.params.forEach((args: FunctionDeclaration, index: number) => {
      localStore[args.name] = this.argument[index]?.evaluate(localStore);
    });

    let result: unknown = null;

    for (const body of func.body.evaluate(localStore)) {
      const evaluate = body.evaluate(localStore);

      if (evaluate) {
        result = evaluate;
      }
    }

    for (const key in localStore) {
      if (key in score) {
        score = { ...score, [key]: localStore[key] };
      }
    }

    return result;
  }
}

export { FunctionCall };
