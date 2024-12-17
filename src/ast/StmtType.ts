import { type Position } from "../lexer/Position";
import { Environment } from "../Environment";

abstract class StmtType {
  abstract position: Position;

  abstract evaluate(score?: Environment): any;
}

export { StmtType };
