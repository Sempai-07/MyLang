"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FunctionCall = void 0;
const StmtType_1 = require("../StmtType");
const FunctionDeclaration_1 = require("../declaration/FunctionDeclaration");
const FunctionExpression_1 = require("../expression/FunctionExpression");
const BaseError_1 = require("../../errors/BaseError");
const Runtime_1 = require("../../runtime/Runtime");
class FunctionCall extends StmtType_1.StmtType {
    name;
    argument;
    position;
    constructor(name, argument, position) {
        super();
        this.name = name;
        this.argument = argument;
        this.position = position;
    }
    evaluate(score) {
        try {
            const func = score.get(this.name);
            if (func instanceof FunctionDeclaration_1.FunctionDeclaration ||
                func instanceof FunctionExpression_1.FunctionExpression) {
                Runtime_1.runtime.markFunctionCallPosition();
                return func
                    .evaluate(func.parentEnv)
                    .call(this.argument.map((arg) => arg.evaluate(func.parentEnv)));
            }
            if (typeof func === "function") {
                return func(this.argument.map((arg) => arg.evaluate(func.parentEnv)), score);
            }
            return null;
        }
        catch (err) {
            if (err instanceof BaseError_1.BaseError) {
                err.files = Array.from(new Set([score.get("import").main, ...err.files])).map((file) => {
                    if (file === score.get("import").main) {
                        return `${this.name} (${file}:${this.position.line}:${this.position.column})`;
                    }
                    return file;
                });
            }
            throw err;
        }
    }
}
exports.FunctionCall = FunctionCall;
