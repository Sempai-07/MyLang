"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockStatement = void 0;
const StmtType_1 = require("../StmtType");
const DeferDeclaration_1 = require("../declaration/DeferDeclaration");
const Runtime_1 = require("../../runtime/Runtime");
class BlockStatement extends StmtType_1.StmtType {
    body;
    position;
    constructor(body, position) {
        super();
        this.body = body;
        this.position = position;
    }
    evaluate(score) {
        const deferenceCall = [];
        try {
            for (let i = 0; i < this.body.length; i++) {
                if (Runtime_1.runtime.isReturn || Runtime_1.runtime.isBreak) {
                    break;
                }
                const blockStatement = this.body[i];
                if (blockStatement instanceof DeferDeclaration_1.DeferDeclaration) {
                    if (blockStatement.value instanceof BlockStatement) {
                        deferenceCall.push([score, blockStatement]);
                        continue;
                    }
                    deferenceCall.push([score.clone(), blockStatement]);
                }
                else {
                    Runtime_1.runtime.callStack.add(score, blockStatement);
                    if (!Runtime_1.runtime.isContinue) {
                        Runtime_1.runtime.resume();
                    }
                    else {
                        Runtime_1.runtime.resetContinue();
                        continue;
                    }
                }
            }
        }
        catch (err) {
            throw err;
        }
        finally {
            if (deferenceCall.length) {
                const _isBreak = Runtime_1.runtime.isBreak;
                const _isReturn = Runtime_1.runtime.isReturn;
                const _isContinue = Runtime_1.runtime.isContinue;
                const result = Runtime_1.runtime.getLastFunctionExecutionResult();
                Runtime_1.runtime._isBreak = false;
                Runtime_1.runtime._isReturn = false;
                Runtime_1.runtime._isContinue = false;
                for (const [score, defer] of deferenceCall) {
                    defer.evaluate(score);
                }
                Runtime_1.runtime._isBreak = _isBreak;
                Runtime_1.runtime._isReturn = _isReturn;
                Runtime_1.runtime._isContinue = _isContinue;
                Runtime_1.runtime._lastFunctionExecutionResult = result;
            }
        }
    }
}
exports.BlockStatement = BlockStatement;
