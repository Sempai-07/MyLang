import { StmtType } from "../ast/StmtType";
import { Environment } from "../Environment";

class CallStack {
  stacks: Array<{ environment: Environment; statement: StmtType }> = [];
  cursor: number = -1;

  add(environment: Environment, statement: StmtType) {
    this.cursor++;
    this.stacks[this.cursor] = { environment, statement };
  }

  peek(): { environment: Environment; statement: StmtType } {
    return this.stacks[this.cursor]!;
  }

  pop(): { environment: Environment; statement: StmtType } {
    const value = this.peek();
    this.cursor = this.cursor - 1;
    return value;
  }

  setCursor(cursor: number) {
    if (cursor > this.cursor) {
      throw new Error("call stack cursor can not go back!");
    }
    this.cursor = cursor;
  }

  getCursor(): number {
    return this.cursor;
  }

  isEmpty(): boolean {
    return this.cursor === -1;
  }
}

export { CallStack };
