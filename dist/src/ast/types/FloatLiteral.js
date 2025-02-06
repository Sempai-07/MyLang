"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FloatLiteral = void 0;
const StmtType_1 = require("../StmtType");
class FloatLiteral extends StmtType_1.StmtType {
    value;
    position;
    constructor(value, position) {
        super();
        this.value = value;
        this.position = position;
    }
    evaluate() {
        return parseFloat(this.value);
    }
}
exports.FloatLiteral = FloatLiteral;
