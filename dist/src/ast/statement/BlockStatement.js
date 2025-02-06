"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockStatement = void 0;
const StmtType_1 = require("../StmtType");
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
        for (let i = 0; i < this.body.length; i++) {
            if (Runtime_1.runtime.isReturn || Runtime_1.runtime.isBreak) {
                break;
            }
            Runtime_1.runtime.callStack.add(score, this.body[i]);
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
exports.BlockStatement = BlockStatement;
