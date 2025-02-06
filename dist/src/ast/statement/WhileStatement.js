"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhileStatement = void 0;
const StmtType_1 = require("../StmtType");
const Environment_1 = require("../../Environment");
const Runtime_1 = require("../../runtime/Runtime");
const BaseError_1 = require("../../errors/BaseError");
class WhileStatement extends StmtType_1.StmtType {
    test;
    body;
    position;
    constructor(test, body, position) {
        super();
        this.test = test;
        this.body = body;
        this.position = position;
    }
    evaluate(score) {
        try {
            const bridgeEnvironment = new Environment_1.Environment(score);
            Runtime_1.runtime.markIterationCallPosition();
            while (!Runtime_1.runtime.isReturn &&
                !Runtime_1.runtime.isBreak &&
                this.test.evaluate(bridgeEnvironment)) {
                const executionEnvironment = new Environment_1.Environment(bridgeEnvironment);
                this.body.evaluate(executionEnvironment);
            }
            Runtime_1.runtime.resetIsBreak();
        }
        catch (err) {
            if (err instanceof BaseError_1.BaseError) {
                err.files = Array.from(new Set([score.get("import").main, ...err.files])).map((file) => {
                    if (file === score.get("import").main) {
                        return `While (${file}:${this.position.line}:${this.position.column})`;
                    }
                    return file;
                });
            }
            throw err;
        }
    }
}
exports.WhileStatement = WhileStatement;
