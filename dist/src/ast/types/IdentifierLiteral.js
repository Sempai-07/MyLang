"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentifierLiteral = void 0;
const StmtType_1 = require("../StmtType");
class IdentifierLiteral extends StmtType_1.StmtType {
    value;
    position;
    constructor(value, position) {
        super();
        this.value = value;
        this.position = position;
    }
    evaluate(score) {
        return score.get(this.value);
    }
}
exports.IdentifierLiteral = IdentifierLiteral;
