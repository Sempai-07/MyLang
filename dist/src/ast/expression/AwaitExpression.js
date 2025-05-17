"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AwaitExpression = void 0;
const StmtType_1 = require("../StmtType");
const BaseError_1 = require("../../errors/BaseError");
const Task_1 = require("../../runtime/task/Task");
const symbol_1 = require("../../native/lib/promises/symbol");
class AwaitExpression extends StmtType_1.StmtType {
    position;
    value;
    constructor(value, position) {
        super();
        this.value = value;
        this.position = position;
    }
    evaluate(score) {
        try {
            const value = this.value.evaluate(score);
            if (!(value instanceof Task_1.Task)) {
                throw new BaseError_1.BaseError("await can only be used on promises", {
                    files: score.get("import").paths,
                });
            }
            value[symbol_1.PromiseCustom]?.start();
            return value[symbol_1.PromiseCustom]?.getResult();
        }
        catch (err) {
            if (err instanceof BaseError_1.BaseError) {
                err.files = Array.from(new Set([score.get("import").main, ...err.files])).map((file) => {
                    if (file === score.get("import").main) {
                        return `await (${file}:${this.position.line}:${this.position.column})`;
                    }
                    return file;
                });
            }
            throw err;
        }
    }
}
exports.AwaitExpression = AwaitExpression;
