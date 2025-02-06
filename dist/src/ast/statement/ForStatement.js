"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForStatement = void 0;
const StmtType_1 = require("../StmtType");
const Environment_1 = require("../../Environment");
const BaseError_1 = require("../../errors/BaseError");
const Runtime_1 = require("../../runtime/Runtime");
class ForStatement extends StmtType_1.StmtType {
    init;
    test;
    update;
    body;
    position;
    constructor(init, test, update, body, position) {
        super();
        this.init = init;
        this.test = test;
        this.update = update;
        this.body = body;
        this.position = position;
    }
    evaluate(score) {
        try {
            const bridgeEnvironment = new Environment_1.Environment(score);
            Runtime_1.runtime.markIterationCallPosition();
            this.init.evaluate(bridgeEnvironment);
            while (!Runtime_1.runtime.isBreak &&
                !Runtime_1.runtime.isReturn &&
                this.test.evaluate(bridgeEnvironment)) {
                const executionEnvironment = new Environment_1.Environment(bridgeEnvironment);
                this.body.evaluate(executionEnvironment);
                this.update.evaluate(executionEnvironment);
            }
            Runtime_1.runtime.resetIsBreak();
        }
        catch (err) {
            if (err instanceof BaseError_1.BaseError) {
                err.files = Array.from(new Set([score.get("import").main, ...err.files])).map((file) => {
                    if (file === score.get("import").main) {
                        return `For (${file}:${this.position.line}:${this.position.column})`;
                    }
                    return file;
                });
            }
            throw err;
        }
    }
}
exports.ForStatement = ForStatement;
