"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runtime = void 0;
const CallStack_1 = require("./CallStack");
const BaseError_1 = require("../errors/BaseError");
const BreakStatement_1 = require("../ast/statement/BreakStatement");
const ReturnStatement_1 = require("../ast/statement/ReturnStatement");
const ContinueStatement_1 = require("../ast/statement/ContinueStatement");
const TaskQueue_1 = require("./task/TaskQueue");
class Runtime {
    callStack = new CallStack_1.CallStack();
    taskQueue = new TaskQueue_1.TaskQueue();
    _functionCallPositionStack = [];
    _lastFunctionExecutionResult = null;
    _iterationCallPositionStack = [];
    _isBreak = false;
    _isReturn = false;
    _isContinue = false;
    resume() {
        if (this.callStack.isEmpty()) {
            return null;
        }
        const { environment, statement } = this.callStack.peek();
        if (statement instanceof ContinueStatement_1.ContinueStatement) {
            this._isContinue = true;
        }
        const value = statement.evaluate(environment);
        if (statement instanceof ReturnStatement_1.ReturnStatement) {
            this._isReturn = true;
            this._lastFunctionExecutionResult = value;
            try {
                this.finishLastFunctionCall();
            }
            catch (e) {
                throw String(e);
            }
        }
        if (statement instanceof BreakStatement_1.BreakStatement) {
            this._isBreak = true;
            try {
                this.finishLastIterationCall();
            }
            catch (e) {
                throw String(e);
            }
        }
        this.callStack.pop();
        return null;
    }
    getLastFunctionExecutionResult() {
        return this._lastFunctionExecutionResult;
    }
    resetLastFunctionExecutionResult() {
        this._isReturn = false;
        this._lastFunctionExecutionResult = null;
    }
    markFunctionCallPosition() {
        this._functionCallPositionStack.push(this.callStack.getCursor());
    }
    markIterationCallPosition() {
        this._iterationCallPositionStack.push(this.callStack.getCursor());
    }
    finishLastFunctionCall() {
        if (this._functionCallPositionStack.length == 0) {
            const environment = this.callStack.stacks[this.callStack.stacks.length - 1]?.environment
                .values["import"]?.paths ??
                this.callStack.stacks[this.callStack.stacks.length - 1]?.environment
                    .parent
                    ?.values["import"]?.paths ??
                [];
            throw new BaseError_1.BaseError("return statement can only exit in function body", {
                files: environment,
            });
        }
        this._functionCallPositionStack.pop();
    }
    finishLastIterationCall() {
        const lastFunctionCall = this._functionCallPositionStack[this._functionCallPositionStack.length - 1];
        const lastIterationCall = this._iterationCallPositionStack[this._iterationCallPositionStack.length - 1];
        if (lastIterationCall === undefined ||
            lastIterationCall === undefined ||
            lastIterationCall < lastFunctionCall) {
            const environment = this.callStack.stacks[this.callStack.stacks.length - 1]?.environment
                .values["import"]?.paths ??
                this.callStack.stacks[this.callStack.stacks.length - 1]?.environment
                    .parent
                    ?.values["import"]?.paths ??
                [];
            throw new BaseError_1.BaseError("break statement can only exist in iteration block", {
                files: environment,
            });
        }
        this._iterationCallPositionStack.pop();
    }
    get isBreak() {
        return this._isBreak;
    }
    get isReturn() {
        return this._isReturn;
    }
    get isContinue() {
        return this._isContinue;
    }
    resetIsBreak() {
        this._isBreak = false;
    }
    resetContinue() {
        this._isContinue = false;
    }
}
const runtime = new Runtime();
exports.runtime = runtime;
