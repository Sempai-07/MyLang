import type { Position } from "../lexer/Token";

abstract class Stmt {
  abstract position: Position;

  evaluate(score: Record<string, any>): unknown;
  evaluate(): unknown {
    throw new Error("This function is not implemented");
  }
}

export { Stmt };
