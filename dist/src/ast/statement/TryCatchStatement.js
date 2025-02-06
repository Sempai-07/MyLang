"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TryCatchStatement = void 0;
const StmtType_1 = require("../StmtType");
const Environment_1 = require("../../Environment");
class TryCatchStatement extends StmtType_1.StmtType {
    tryBlock;
    catchBlock;
    finallyBlock;
    position;
    constructor(tryBlock, catchBlock, finallyBlock, position) {
        super();
        this.tryBlock = tryBlock;
        this.catchBlock = catchBlock;
        this.finallyBlock = finallyBlock;
        this.position = position;
    }
    evaluate(score) {
        try {
            const callEnvironment = new Environment_1.Environment(score);
            this.tryBlock.evaluate(callEnvironment);
        }
        catch (err) {
            if (this.catchBlock) {
                const callEnvironment = new Environment_1.Environment(score);
                if (this.catchBlock[0]) {
                    callEnvironment.create(this.catchBlock[0], err);
                    this.catchBlock[1].evaluate(callEnvironment);
                }
                else
                    this.catchBlock[1].evaluate(callEnvironment);
            }
        }
        finally {
            if (this.finallyBlock) {
                const callEnvironment = new Environment_1.Environment(score);
                this.finallyBlock.evaluate(callEnvironment);
            }
        }
    }
}
exports.TryCatchStatement = TryCatchStatement;
