"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchStatement = void 0;
const node_assert_1 = require("node:assert");
const StmtType_1 = require("../StmtType");
const Environment_1 = require("../../Environment");
const BlockStatement_1 = require("./BlockStatement");
const Runtime_1 = require("../../runtime/Runtime");
const BaseError_1 = require("../../errors/BaseError");
function deepEqualTry(actual, expected) {
    try {
        (0, node_assert_1.deepEqual)(actual, expected);
        return true;
    }
    catch {
        return false;
    }
}
class MatchStatement extends StmtType_1.StmtType {
    test;
    cases;
    defaultCase;
    position;
    constructor(test, cases, defaultCase, position) {
        super();
        this.test = test;
        this.cases = cases;
        this.defaultCase = defaultCase;
        this.position = position;
    }
    evaluate(score) {
        try {
            let isMatchTry = false;
            const test = this.test.evaluate(score);
            for (const { condition, block } of this.cases) {
                if (Runtime_1.runtime.isReturn)
                    break;
                if (deepEqualTry(test, condition.evaluate(score))) {
                    isMatchTry = true;
                    if (block instanceof BlockStatement_1.BlockStatement) {
                        const matchEnvironment = new Environment_1.Environment(score);
                        block.evaluate(matchEnvironment);
                        continue;
                    }
                    block.evaluate(score);
                }
            }
            if (this.defaultCase && !isMatchTry) {
                if (this.defaultCase instanceof BlockStatement_1.BlockStatement) {
                    const matchEnvironment = new Environment_1.Environment(score);
                    this.defaultCase.evaluate(matchEnvironment);
                }
                else
                    this.defaultCase.evaluate(score);
            }
            return null;
        }
        catch (err) {
            if (err instanceof BaseError_1.BaseError) {
                err.files = Array.from(new Set([score.get("import").main, ...err.files])).map((file) => {
                    if (file === score.get("import").main) {
                        return `Match (${file}:${this.position.line}:${this.position.column})`;
                    }
                    return file;
                });
            }
            throw err;
        }
    }
}
exports.MatchStatement = MatchStatement;
