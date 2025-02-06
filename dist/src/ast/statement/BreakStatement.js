"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BreakStatement = void 0;
const StmtType_1 = require("../StmtType");
class BreakStatement extends StmtType_1.StmtType {
    position;
    constructor(position) {
        super();
        this.position = position;
    }
    evaluate() {
        return null;
    }
}
exports.BreakStatement = BreakStatement;
