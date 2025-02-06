"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallStack = void 0;
class CallStack {
    stacks = [];
    cursor = -1;
    add(environment, statement) {
        this.cursor++;
        this.stacks[this.cursor] = { environment, statement };
    }
    peek() {
        return this.stacks[this.cursor];
    }
    pop() {
        const value = this.peek();
        this.cursor = this.cursor - 1;
        return value;
    }
    setCursor(cursor) {
        if (cursor > this.cursor) {
            throw "call stack cursor can not go back!";
        }
        this.cursor = cursor;
    }
    getCursor() {
        return this.cursor;
    }
    isEmpty() {
        return this.cursor === -1;
    }
}
exports.CallStack = CallStack;
