"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IfStatement = void 0;
const StmtType_1 = require("../StmtType");
const Environment_1 = require("../../Environment");
const BlockStatement_1 = require("./BlockStatement");
const BaseError_1 = require("../../errors/BaseError");
class IfStatement extends StmtType_1.StmtType {
    test;
    consequent;
    alternate;
    position;
    constructor(test, consequent, alternate, position) {
        super();
        this.test = test;
        this.consequent = consequent;
        this.alternate = alternate;
        this.position = position;
    }
    evaluate(score) {
        try {
            if (this.test.evaluate(score)) {
                const executionEnvironment = new Environment_1.Environment(score);
                return this.consequent.evaluate(executionEnvironment);
            }
            else if (this.alternate) {
                if (this.alternate instanceof BlockStatement_1.BlockStatement) {
                    const executionEnvironment = new Environment_1.Environment(score);
                    return this.alternate.evaluate(executionEnvironment);
                }
                else {
                    return this.alternate.evaluate(score);
                }
            }
        }
        catch (err) {
            if (err instanceof BaseError_1.BaseError) {
                err.files = Array.from(new Set([score.get("import").main, ...err.files])).map((file) => {
                    if (file === score.get("import").main) {
                        return `If (${file}:${this.position.line}:${this.position.column})`;
                    }
                    return file;
                });
            }
            throw err;
        }
    }
}
exports.IfStatement = IfStatement;
