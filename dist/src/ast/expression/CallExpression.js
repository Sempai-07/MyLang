"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallExpression = void 0;
const StmtType_1 = require("../StmtType");
const MemberExpression_1 = require("./MemberExpression");
const FunctionDeclaration_1 = require("../declaration/FunctionDeclaration");
const FunctionExpression_1 = require("../expression/FunctionExpression");
const BaseError_1 = require("../../errors/BaseError");
class CallExpression extends StmtType_1.StmtType {
    identifier;
    method;
    callee;
    argument;
    position;
    constructor(identifier, method, callee, argument, position) {
        super();
        this.identifier = identifier;
        this.method = method;
        this.callee = callee;
        this.argument = argument;
        this.position = position;
    }
    evaluate(score) {
        try {
            if (!this.callee) {
                if (score.get(this.identifier) instanceof FunctionDeclaration_1.FunctionDeclaration ||
                    score.get(this.identifier) instanceof FunctionExpression_1.FunctionExpression) {
                    return score
                        .get(this.identifier)
                        .call(this.argument.map((arg) => arg.evaluate(score)));
                }
                if (!(this.method in score.get(this.identifier))) {
                    throw new BaseError_1.FunctionCallError(`${this.identifier}.${this.method} is not method`, score.get("import").paths);
                }
                const methodVar = score.get(this.identifier)[this.method];
                if (methodVar instanceof FunctionDeclaration_1.FunctionDeclaration ||
                    methodVar instanceof FunctionExpression_1.FunctionExpression) {
                    return methodVar.call(this.argument.map((arg) => arg.evaluate(score)));
                }
                return methodVar(this.argument.map((arg) => arg.evaluate(score)), score);
            }
            const obj = this.callee.evaluate(score);
            const methodRef = obj?.[this.method];
            if (methodRef instanceof FunctionDeclaration_1.FunctionDeclaration ||
                methodRef instanceof FunctionExpression_1.FunctionExpression) {
                return methodRef.call(this.argument.map((arg) => arg.evaluate(score)), this.callee instanceof MemberExpression_1.MemberExpression
                    ? this.callee.obj.evaluate(methodRef.parentEnv)?.[this.callee.property.evaluate(methodRef.parentEnv)]
                    : this.callee.evaluate(score));
            }
            if (typeof methodRef !== "function") {
                throw new BaseError_1.FunctionCallError(`${this.identifier}.${this.method} is not method`, score.get("import").paths);
            }
            return methodRef(this.argument.map((arg) => arg.evaluate(score)), score);
        }
        catch (err) {
            if (err instanceof BaseError_1.BaseError) {
                err.files = Array.from(new Set([score.get("import").main, ...err.files])).map((file) => {
                    if (file === score.get("import").main) {
                        return `${this.identifier}.${this.method} (${file}:${this.position.line}:${this.position.column})`;
                    }
                    return file;
                });
            }
            throw err;
        }
    }
}
exports.CallExpression = CallExpression;
