"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntLiteral = void 0;
const StmtType_1 = require("../StmtType");
class IntLiteral extends StmtType_1.StmtType {
    value;
    position;
    constructor(value, position) {
        super();
        this.value = value;
        this.position = position;
    }
    evaluate() {
        return parseInt(this.value);
    }
}
exports.IntLiteral = IntLiteral;
