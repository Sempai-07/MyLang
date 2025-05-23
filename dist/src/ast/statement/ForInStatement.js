"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForInStatement = void 0;
const StmtType_1 = require("../StmtType");
const Environment_1 = require("../../Environment");
const VariableDeclaration_1 = require("../declaration/VariableDeclaration");
const IdentifierLiteral_1 = require("../types/IdentifierLiteral");
const BaseError_1 = require("../../errors/BaseError");
const Runtime_1 = require("../../runtime/Runtime");
const index_1 = require("../../native/lib/utils/index");
const index_2 = require("../../native/lib/iter/index");
class ForInStatement extends StmtType_1.StmtType {
    variable;
    iterable;
    body;
    position;
    constructor(variable, iterable, body, position) {
        super();
        this.variable = variable;
        this.iterable = iterable;
        this.body = body;
        this.position = position;
    }
    evaluate(score) {
        try {
            Runtime_1.runtime.markIterationCallPosition();
            const bridgeEnvironment = new Environment_1.Environment(score);
            this.variable.evaluate(bridgeEnvironment);
            let variable = null;
            if (this.variable instanceof VariableDeclaration_1.VariableDeclaration) {
                variable = this.variable.name;
            }
            else if (this.variable instanceof IdentifierLiteral_1.IdentifierLiteral) {
                variable = this.variable.value;
            }
            if (!variable) {
                throw new BaseError_1.BaseError("Expected a variable or identifier");
            }
            const iterable = this.iterable.evaluate(bridgeEnvironment);
            if (iterable?.[index_2.symbol]) {
                const iterator = iterable[index_2.symbol].call([iterable], iterable);
                let result = iterator.next();
                while (!result.done) {
                    const value = result.value;
                    if (Runtime_1.runtime.isBreak || Runtime_1.runtime.isReturn)
                        break;
                    bridgeEnvironment.ensure(variable, value);
                    this.body.evaluate(new Environment_1.Environment(bridgeEnvironment));
                    result = iterator.next();
                }
            }
            else if ((0, index_1.typeOf)([iterable]) === "array") {
                for (const value of iterable) {
                    if (Runtime_1.runtime.isBreak || Runtime_1.runtime.isReturn)
                        break;
                    bridgeEnvironment.ensure(variable, value);
                    this.body.evaluate(new Environment_1.Environment(bridgeEnvironment));
                }
            }
            else if ((0, index_1.typeOf)([iterable]) === "object") {
                for (const key of iterable?.[Symbol.iterator]
                    ? iterable
                    : Object.keys(iterable)) {
                    if (Runtime_1.runtime.isBreak || Runtime_1.runtime.isReturn)
                        break;
                    bridgeEnvironment.update(variable, key);
                    this.body.evaluate(new Environment_1.Environment(bridgeEnvironment));
                }
            }
            else {
                throw new BaseError_1.BaseError(`${(0, index_1.typeOf)([iterable])} is not iterable`);
            }
            Runtime_1.runtime.resetIsBreak();
        }
        catch (err) {
            if (err instanceof BaseError_1.BaseError) {
                err.files = Array.from(new Set([score.get("import").main, ...err.files])).map((file) => file === score.get("import").main
                    ? `ForIn (${file}:${this.position.line}:${this.position.column})`
                    : file);
            }
            throw err;
        }
    }
}
exports.ForInStatement = ForInStatement;
