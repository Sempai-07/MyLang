"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.input = void 0;
exports.printf = printf;
exports.print = print;
const input_1 = require("./input");
Object.defineProperty(exports, "input", { enumerable: true, get: function () { return input_1.input; } });
const utils_1 = require("../../utils");
const BaseError_1 = require("../../../errors/BaseError");
const Task_1 = require("../../../runtime/task/Task");
const symbol_1 = require("../promises/symbol");
function processArray(arr) {
    arr.forEach((value, index) => {
        if (Array.isArray(value)) {
            arr[index] = processArray(value);
        }
        else if (value && typeof value === "object") {
            if (value instanceof BaseError_1.BaseError) {
                arr[index] = value.toString();
            }
            else if (value instanceof Task_1.Task) {
                arr[index] =
                    `Promise { ${value[symbol_1.PromiseCustom].getResult() ? value[symbol_1.PromiseCustom].getResult() : "nil"} }`;
            }
            else
                arr[index] = processObject(value);
        }
        else if ((0, utils_1.isFunctionNode)(value)) {
            arr[index] = value?.name
                ? { [String(value.name)]() { } }[value.name]
                : { anonymous() { } }["anonymous"];
        }
        else if (value === null) {
            arr[index] = "nil";
        }
    });
    return arr;
}
function processObject(obj) {
    if ((0, utils_1.isFunctionNode)(obj)) {
        return obj?.name
            ? { [String(obj.name)]() { } }[obj.name]
            : { anonymous() { } }["anonymous"];
    }
    for (const [name, value] of Object.entries(obj)) {
        if (Array.isArray(value)) {
            obj[name] = processArray(value);
        }
        else if (value && typeof value === "object") {
            if (value instanceof BaseError_1.BaseError) {
                obj[name] = value.toString();
                continue;
            }
            else if (value instanceof Task_1.Task) {
                obj[name] =
                    `Promise { ${value[symbol_1.PromiseCustom].getResult() ? value[symbol_1.PromiseCustom].getResult() : "nil"} }`;
                continue;
            }
            obj[name] = processObject(value);
        }
        else if ((0, utils_1.isFunctionNode)(value)) {
            obj[name] = value?.name
                ? { [String(value.name)]() { } }[value.name]
                : { anonymous() { } }["anonymous"];
        }
        else if (value === null) {
            obj[name] = "nil";
        }
    }
    return obj;
}
function printf(args) {
    const regex = /&\{(\d+)\}/g;
    const template = args[0] ?? "";
    if (args[0] instanceof BaseError_1.BaseError) {
        console.error(args[0].toString());
        return;
    }
    if (typeof template !== "string") {
        const processedArgs = [...args].map((value) => {
            if (Array.isArray(value)) {
                return processArray([...value]);
            }
            else if (value && typeof value === "object") {
                if (value instanceof BaseError_1.BaseError) {
                    return value.toString();
                }
                else if ((0, utils_1.isFunctionNode)(value)) {
                    return value?.name
                        ? { [String(value.name)]() { } }[value.name]
                        : { anonymous() { } }["anonymous"];
                }
                else if (value instanceof Task_1.Task) {
                    return `Promise { ${value[symbol_1.PromiseCustom].getResult() ? value[symbol_1.PromiseCustom].getResult() : "nil"} }`;
                }
                return processObject({ ...value });
            }
            else if (value === null) {
                return "nil";
            }
            return value;
        });
        console.log(...processedArgs);
        return;
    }
    args.shift();
    const result = template.replace(regex, (_, index) => {
        const argIndex = parseInt(index, 10);
        return args[argIndex - 1] ?? "";
    });
    console.log(result);
}
function print(args) {
    if (args[0] instanceof BaseError_1.BaseError) {
        console.error(args[0].toString());
        return;
    }
    const processedArgs = [...args].map((value) => {
        if (Array.isArray(value)) {
            return processArray([...value]);
        }
        else if (value && typeof value === "object") {
            if (value instanceof BaseError_1.BaseError) {
                return value.toString();
            }
            else if ((0, utils_1.isFunctionNode)(value)) {
                return value?.name
                    ? { [String(value.name)]() { } }[value.name]
                    : { anonymous() { } }["anonymous"];
            }
            else if (value instanceof Task_1.Task) {
                return `Promise { ${value[symbol_1.PromiseCustom].getResult() ? value[symbol_1.PromiseCustom].getResult() : "nil"} }`;
            }
            return processObject({ ...value });
        }
        else if (value === null) {
            return "nil";
        }
        return value;
    });
    console.log(...processedArgs);
    return;
}
