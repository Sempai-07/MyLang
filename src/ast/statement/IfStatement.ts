import { StmtType } from "../StmtType";
import { type Position } from "../../lexer/token/Position";
import { Environment } from "../../Environment";
import { BlockStatement } from "./BlockStatement";

class IfStatement extends StmtType {
  public readonly test: StmtType;
  public readonly consequent: StmtType;
  public readonly alternate: StmtType | null;
  public readonly position: Position;

  constructor(
    test: StmtType,
    consequent: StmtType,
    alternate: StmtType | null,
    position: Position,
  ) {
    super();

    this.test = test;

    this.consequent = consequent;

    this.alternate = alternate;

    this.position = position;
  }

  async evaluate(score: Environment) {
    try {
      if (await this.test.evaluate(score)) {
        const executionEnvironment = new Environment(score);
        return this.consequent.evaluate(executionEnvironment);
      } else if (this.alternate) {
        if (this.alternate instanceof BlockStatement) {
          const executionEnvironment = new Environment(score);
          return this.alternate.evaluate(executionEnvironment);
        } else {
          return this.alternate.evaluate(score);
        }
      }
    } catch (err) {
      throw super.throwErrorFormatters(err, score);
    }
  }
}

export { IfStatement };
