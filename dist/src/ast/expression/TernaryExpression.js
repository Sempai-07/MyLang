"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TernaryExpression = void 0;
const StmtType_1 = require("../StmtType");
const BaseError_1 = require("../../errors/BaseError");
class TernaryExpression extends StmtType_1.StmtType {
    condition;
    expressionIfTrue;
    expressionIfFalse;
    position;
    constructor(condition, expressionIfTrue, expressionIfFalse, position) {
        super();
        this.condition = condition;
        this.expressionIfTrue = expressionIfTrue;
        this.expressionIfFalse = expressionIfFalse;
        this.position = position;
    }
    evaluate(score) {
        try {
            let condition = this.condition.evaluate(score);
            if (Array.isArray(condition)) {
                condition = condition.length;
            }
            else if (condition && typeof condition === "object") {
                condition = Object.keys(condition).length;
            }
            if (condition) {
                return this.expressionIfTrue.evaluate(score);
            }
            return this.expressionIfFalse.evaluate(score);
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
exports.TernaryExpression = TernaryExpression;
