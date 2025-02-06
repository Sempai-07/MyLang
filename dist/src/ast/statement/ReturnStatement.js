"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReturnStatement = void 0;
const StmtType_1 = require("../StmtType");
const BaseError_1 = require("../../errors/BaseError");
class ReturnStatement extends StmtType_1.StmtType {
    body;
    position;
    constructor(body, position) {
        super();
        this.body = body;
        this.position = position;
    }
    evaluate(score) {
        try {
            if (Array.isArray(this.body)) {
                return this.body.map((value) => value.evaluate(score));
            }
            if (!(this.body instanceof StmtType_1.StmtType)) {
                return this.body;
            }
            return this.body.evaluate(score);
        }
        catch (err) {
            if (err instanceof BaseError_1.BaseError) {
                err.files = Array.from(new Set([score.get("import").main, ...err.files])).map((file) => {
                    if (file === score.get("import").main) {
                        return `${file}:${this.position.line}:${this.position.column}`;
                    }
                    return file;
                });
            }
            throw err;
        }
    }
}
exports.ReturnStatement = ReturnStatement;
