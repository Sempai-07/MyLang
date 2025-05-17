"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Task = void 0;
const node_events_1 = require("node:events");
const utils_1 = require("../../native/utils");
const symbol_1 = require("../../native/lib/promises/symbol");
const BaseError_1 = require("../../errors/BaseError");
class TaskCustom extends node_events_1.EventEmitter {
    taskFn;
    result = null;
    isCompleted = false;
    isRunning = false;
    hasLogged = false;
    constructor(taskFn) {
        super();
        this.taskFn = taskFn;
    }
    start() {
        if (this.isRunning) {
            throw new Error("Task is already running");
        }
        this.isRunning = true;
        try {
            this.result = this.taskFn();
            this.emit("data", this.result);
        }
        catch (err) {
            this.result = err;
            this.emit("error", err);
        }
        finally {
            this.isCompleted = true;
            this.emit("finally");
        }
    }
    getResult() {
        return this.isCompleted ? this.result : null;
    }
    isAlertRunning() {
        return this.isRunning;
    }
    isFinished() {
        return this.isCompleted;
    }
    logResult() {
        if (this.isFinished() && !this.hasLogged) {
            console.log("Task finished with result:", this.getResult());
            this.hasLogged = true;
        }
    }
}
class Task {
    [symbol_1.PromiseCustom];
    constructor(taskFn) {
        this[symbol_1.PromiseCustom] = new TaskCustom(taskFn);
        this.then = this.then.bind(this);
        this.catch = this.catch.bind(this);
        this.finally = this.finally.bind(this);
    }
    then([cb]) {
        if (!(0, utils_1.isFunctionNode)(cb)) {
            throw new BaseError_1.FunctionCallError("Invalid callback function.", []);
        }
        this[symbol_1.PromiseCustom].on("data", (data) => {
            if (data instanceof Task) {
                data[symbol_1.PromiseCustom].on("data", (data) => {
                    cb.call([{ value: data }]);
                });
                return;
            }
            cb.call([{ value: data }]);
        });
        return new Task(() => this[symbol_1.PromiseCustom].getResult());
    }
    catch([cb]) {
        if (!(0, utils_1.isFunctionNode)(cb)) {
            throw new BaseError_1.FunctionCallError("Invalid callback function.", []);
        }
        this[symbol_1.PromiseCustom].on("data", (data) => {
            if (data instanceof Task) {
                data[symbol_1.PromiseCustom].on("error", (err) => {
                    cb.call([{ value: err }]);
                });
                return;
            }
        });
        this[symbol_1.PromiseCustom].on("error", (err) => {
            if (err instanceof Task) {
                err[symbol_1.PromiseCustom].on("error", (err) => {
                    cb.call([{ value: err }]);
                });
                return;
            }
            cb.call([{ value: err }]);
        });
        return new Task(() => this[symbol_1.PromiseCustom].getResult());
    }
    finally([cb]) {
        if (!(0, utils_1.isFunctionNode)(cb)) {
            throw new BaseError_1.FunctionCallError("Invalid callback function.", []);
        }
        this[symbol_1.PromiseCustom].on("finally", () => cb.call([]));
        return new Task(() => this[symbol_1.PromiseCustom].getResult());
    }
}
exports.Task = Task;
