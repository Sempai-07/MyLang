import { TokenType } from "./TokenType";
import { Position } from "./Position";

interface IToken {
  type: TokenType;
  value: string;
  position: {
    line: number;
    column: number;
  };
}

class Token implements IToken {
  public readonly type: TokenType;
  public readonly value: string;
  public readonly position: Position;

  constructor(value: string, type: TokenType, position: Position) {
    this.value = value;
    this.type = type;
    this.position = position;
  }
}

export { Token };
