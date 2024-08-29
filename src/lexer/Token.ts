import { TokenType } from "./TokenType";

interface IToken {
  type: TokenType;
  value: string;
  position: {
    line: number;
    column: number;
  };
}

class Position {
  public readonly line: number;
  public readonly column: number;

  constructor(line: number, column: number) {
    this.line = line;
    this.column = column;
  }
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

export { Token, Position };
