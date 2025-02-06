"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeOf = typeOf;
exports.isEmpty = isEmpty;
const utils_1 = require("../../utils");
const BaseError_1 = require("../../../errors/BaseError");
function typeOf([args]) {
    if (args === undefined || args === null) {
        return "nil";
    }
    const type = typeof args;
    if (type === "number") {
        if (isNaN(args)) {
            return "nan";
        }
        if (!isFinite(args)) {
            return "infinity";
        }
        return Number.isInteger(args) ? "int" : "float";
    }
    if (type === "object") {
        if (args instanceof BaseError_1.BaseError) {
            return "error";
        }
        if (Array.isArray(args)) {
            return "array";
        }
        if ((0, utils_1.isFunctionNode)(args)) {
            return "function";
        }
        return "object";
    }
    if (type === "boolean") {
        return "boolean";
    }
    return "string";
}
function isEmpty([args]) {
    const type = typeOf([args]);
    if (type === "nil") {
        return true;
    }
    else if (type === "string") {
        return args.trim().length === 0;
    }
    else if (type === "object") {
        return Object.keys(args).length === 0;
    }
    else if (type === "array") {
        return args.length === 0;
    }
    else if (type === "function") {
        return args.body?.body.length === 0;
    }
    return false;
}
