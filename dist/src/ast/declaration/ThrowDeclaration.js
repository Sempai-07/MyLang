"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThrowDeclaration = void 0;
const StmtType_1 = require("../StmtType");
const BaseError_1 = require("../../errors/BaseError");
class ThrowDeclaration extends StmtType_1.StmtType {
    value;
    position;
    constructor(value, position) {
        super();
        this.value = value;
        this.position = position;
    }
    evaluate(score) {
        const err = this.value.evaluate(score);
        if (err instanceof BaseError_1.BaseError) {
            throw err;
        }
        throw new BaseError_1.BaseError(err, {
            files: [
                `throw (${score.get("import").main}:${this.position.line}:${this.position.column})`,
            ],
        });
    }
}
exports.ThrowDeclaration = ThrowDeclaration;
