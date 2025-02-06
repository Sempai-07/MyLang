"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StringLiteral = void 0;
const StmtType_1 = require("../StmtType");
class StringLiteral extends StmtType_1.StmtType {
    value;
    position;
    constructor(value, position) {
        super();
        this.value = value;
        this.position = position;
    }
    evaluate() {
        return this.value;
    }
}
exports.StringLiteral = StringLiteral;
