import { StmtType } from "../StmtType";
import { type Position } from "../../lexer/Position";
import { Environment } from "../../Environment";
import { BaseError } from "../../errors/BaseError";

class ReturnStatement extends StmtType {
  public readonly body: StmtType | StmtType[];
  public readonly position: Position;

  constructor(body: StmtType | StmtType[], position: Position) {
    super();

    this.body = body;

    this.position = position;
  }

  evaluate(score: Environment) {
    try {
      if (Array.isArray(this.body)) {
        return this.body.map((value) => value.evaluate(score));
      }
      if (!(this.body instanceof StmtType)) {
        return this.body;
      }
      return this.body.evaluate(score);
    } catch (err) {
      if (err instanceof BaseError) {
        err.files = Array.from(
          new Set([score.get("import").main, ...err.files]),
        ).map((file) => {
          if (file === score.get("import").main) {
            return `${file}:${this.position.line}:${this.position.column}`;
          }
          return file;
        });
      }
      throw err;
    }
  }
}

export { ReturnStatement };
