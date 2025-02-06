"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Token = void 0;
class Token {
    type;
    value;
    position;
    constructor(value, type, position) {
        this.value = value;
        this.type = type;
        this.position = position;
    }
}
exports.Token = Token;
