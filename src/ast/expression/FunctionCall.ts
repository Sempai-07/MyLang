import { StmtType } from "../StmtType";
import { type Position } from "../../lexer/Position";
import { FunctionDeclaration } from "../declaration/FunctionDeclaration";
import { FunctionExpression } from "../expression/FunctionExpression";
import { Environment } from "../../Environment";

class FunctionCall extends StmtType {
  public readonly name: string;
  public readonly argument: StmtType[];
  public readonly position: Position;

  constructor(name: string, argument: StmtType[], position: Position) {
    super();

    this.name = name;

    this.argument = argument;

    this.position = position;
  }

  override evaluate(score: Environment) {
    const func = score.get(this.name);

    if (
      func instanceof FunctionDeclaration ||
      func instanceof FunctionExpression
    ) {
      return func
        .evaluate(func.parentEnv)
        .call(this.argument.map((arg) => arg.evaluate(func.parentEnv)));
    }

    if (typeof func === "function") {
      return func(
        this.argument.map((arg) => arg.evaluate(func.parentEnv)),
        score,
      );
    }

    return "nil";
  }
}

export { FunctionCall };
