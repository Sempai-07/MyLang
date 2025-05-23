"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FunctionCall = void 0;
const StmtType_1 = require("../StmtType");
const FunctionDeclaration_1 = require("../declaration/FunctionDeclaration");
const IdentifierLiteral_1 = require("../types/IdentifierLiteral");
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
                const combinedScore = score.combine(func.parentEnv);
                return func.call(this.argument.map((arg) => {
                    const result = arg.evaluate(combinedScore);
                    if (arg instanceof IdentifierLiteral_1.IdentifierLiteral) {
                        const variableOpts = combinedScore.optionsVar[arg.value];
                        return {
                            ...(variableOpts && { options: variableOpts }),
                            value: result,
                        };
                    }
                    return { value: result };
                }));
            }
            if (typeof func === "function") {
                return func(this.argument.map((arg) => arg.evaluate(score)), score);
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
