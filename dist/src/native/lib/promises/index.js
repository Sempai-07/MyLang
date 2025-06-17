"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Task = Task;
exports.resolve = resolve;
exports.reject = reject;
exports.all = all;
exports.is = is;
const utils_1 = require("../../utils");
const BaseError_1 = require("../../../errors/BaseError");
const Task_1 = require("../../../runtime/task/Task");
const symbol_1 = require("./symbol");
function Task([executor]) {
    if (!(0, utils_1.isFunctionNode)(executor)) {
        throw new BaseError_1.FunctionCallError("Invalid callback function.", [
            `mylang:promises (${__filename})`,
        ]);
    }
    let value;
    let state = "pending";
    let thenHandlers = [];
    let catchHandlers = [];
    let finallyHandlers = [];
    function resolve([result]) {
        if (state !== "pending") {
            return;
        }
        state = "fulfilled";
        value = result;
        thenHandlers.forEach((handler) => handler.call([{ value: result }]));
        finallyHandlers.forEach((handler) => handler.call([]));
    }
    function reject([error]) {
        if (state !== "pending") {
            return;
        }
        state = "rejected";
        value = error;
        catchHandlers.forEach((handler) => handler.call([{ value: error }]));
        finallyHandlers.forEach((handler) => handler.call([]));
    }
    executor.call([{ value: resolve }, { value: reject }]);
    return new Task_1.Task(() => {
        return value;
    });
}
function resolve([val]) {
    return new Task_1.Task(() => {
        let value = val;
        return value;
    });
}
function reject([err]) {
    return new Task_1.Task(() => {
        throw err;
    });
}
function all([promises]) {
    if (!Array.isArray(promises)) {
        throw new BaseError_1.AssignmentError("array is not iterable", {
            files: [`mylang:promises (${__filename})`],
        });
    }
    const results = [];
    for (const func of promises) {
        if (!(func instanceof Task_1.Task)) {
            results.push(func);
            continue;
        }
        func[symbol_1.PromiseCustom].on("data", (data) => {
            if (data instanceof Task_1.Task) {
                data[symbol_1.PromiseCustom].on("data", (data) => {
                    results.push(data);
                });
                data[symbol_1.PromiseCustom].on("error", (err) => {
                    throw new BaseError_1.AssignmentError(`${err}`, {
                        files: [`mylang:promises (${__filename})`],
                    });
                });
                return;
            }
            results.push(data);
        });
        func[symbol_1.PromiseCustom].on("error", (err) => {
            if (err instanceof Task_1.Task) {
                err[symbol_1.PromiseCustom].on("error", (err) => {
                    throw new BaseError_1.AssignmentError(`${err}`, {
                        files: [`mylang:promises (${__filename})`],
                    });
                });
                return;
            }
            throw new BaseError_1.AssignmentError(`${err}`, {
                files: [`mylang:promises (${__filename})`],
            });
        });
    }
    return results;
}
function is([content]) {
    if (!content)
        return false;
    return content instanceof Task_1.Task;
}
