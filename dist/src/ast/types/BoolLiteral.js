"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoolLiteral = void 0;
const StmtType_1 = require("../StmtType");
class BoolLiteral extends StmtType_1.StmtType {
    value;
    position;
    constructor(value, position) {
        super();
        this.value = value;
        this.position = position;
    }
    evaluate() {
        return this.value === "true";
    }
}
exports.BoolLiteral = BoolLiteral;
