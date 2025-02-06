"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeferDeclaration = void 0;
const StmtType_1 = require("../StmtType");
class DeferDeclaration extends StmtType_1.StmtType {
    value;
    position;
    constructor(value, position) {
        super();
        this.value = value;
        this.position = position;
    }
    evaluate(score) {
        return this.value.evaluate(score);
    }
}
exports.DeferDeclaration = DeferDeclaration;
