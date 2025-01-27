import { StmtType } from "../StmtType";
import { type Position } from "../../lexer/Position";
import { Environment } from "../../Environment";
import { BlockStatement } from "./BlockStatement";
import { BaseError } from "../../errors/BaseError";

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

  evaluate(score: Environment) {
    try {
      if (this.test.evaluate(score)) {
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
      if (err instanceof BaseError) {
        err.files = Array.from(
          new Set([score.get("import").main, ...err.files]),
        ).map((file) => {
          if (file === score.get("import").main) {
            return `If (${file}:${this.position.line}:${this.position.column})`;
          }
          return file;
        });
      }
      throw err;
    }
  }
}

export { IfStatement };
