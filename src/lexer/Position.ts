class Position {
  public readonly line: number;
  public readonly column: number;

  constructor(line: number, column: number) {
    this.line = line;
    this.column = column;
  }
}

export { Position };
