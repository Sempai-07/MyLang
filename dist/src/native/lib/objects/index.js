"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assign = assign;
exports.create = create;
exports.defineProperty = defineProperty;
exports.defineProperties = defineProperties;
exports.entries = entries;
exports.fromEntries = fromEntries;
exports.getOwnPropertyNames = getOwnPropertyNames;
exports.is = is;
exports.keys = keys;
exports.setPrototypeOf = setPrototypeOf;
exports.values = values;
exports.omit = omit;
exports.pick = pick;
const utils_1 = require("../../utils");
const BaseError_1 = require("../../../errors/BaseError");
function ensureArgsCount(args, count, message) {
    if (args.length < count) {
        throw new BaseError_1.ArgumentsError(message, [`mylang:objects (${__filename})`]);
    }
}
function assign(args) {
    ensureArgsCount(args, 2, "requires at least 2 arguments: target and sources.");
    return Object.assign(args[0], ...args.slice(1));
}
function create(args) {
    ensureArgsCount(args, 1, "requires at least 1 argument: prototype.");
    const [proto, properties] = args;
    if (typeof proto !== "object" && proto !== null) {
        throw new BaseError_1.ArgumentsError("First argument to create must be an object or nil.", [`mylang:objects (${__filename})`]);
    }
    return Object.create(proto, properties);
}
function defineProperty(args) {
    ensureArgsCount(args, 3, "requires 3 arguments: object, property, and descriptor.");
    const [obj, property, descriptor] = args;
    Object.defineProperty(obj, property, descriptor);
}
function defineProperties(args) {
    ensureArgsCount(args, 2, "requires 2 arguments: object and descriptors.");
    const [obj, descriptors] = args;
    Object.defineProperties(obj, descriptors);
}
function entries(args) {
    ensureArgsCount(args, 1, "requires 1 argument: object.");
    return Object.entries(args[0]);
}
function fromEntries(args) {
    ensureArgsCount(args, 1, "requires 1 argument: iterable.");
    return Object.fromEntries(args[0]);
}
function getOwnPropertyNames(args) {
    ensureArgsCount(args, 1, "requires 1 argument: object.");
    return Object.getOwnPropertyNames(args[0]);
}
function is(args) {
    ensureArgsCount(args, 2, "requires 2 arguments: value1 and value2.");
    return Object.is(args[0], args[1]);
}
function keys(args) {
    ensureArgsCount(args, 1, "requires 1 argument: object.");
    return Object.keys(args[0]);
}
function setPrototypeOf(args) {
    ensureArgsCount(args, 2, "requires 2 arguments: object and prototype.");
    return Object.setPrototypeOf(args[0], args[1]);
}
function values(args) {
    ensureArgsCount(args, 1, "requires 1 argument: object.");
    return Object.values(args[0]);
}
function pick(args) {
    ensureArgsCount(args, 2, "requires at least 2 arguments: object, keys or filter function.");
    const [obj, keysOrFn] = args;
    if (typeof obj !== "object" || obj === null) {
        throw new BaseError_1.ArgumentsError("First argument to pick must be an object.", [
            `mylang:objects (${__filename})`,
        ]);
    }
    let result = create([Object.getPrototypeOf(obj) || null]);
    if ((0, utils_1.isFunctionNode)(keysOrFn)) {
        for (const key in obj) {
            if (keysOrFn.evaluate(keysOrFn.parentEnv).call([obj[key], key, obj])) {
                result[key] = obj[key];
            }
        }
    }
    else if (Array.isArray(keysOrFn)) {
        for (const key of keysOrFn) {
            if (key in obj) {
                result[key] = obj[key];
            }
        }
    }
    return result;
}
function omit(args) {
    ensureArgsCount(args, 2, "requires at least 2 arguments: object, keys or filter function.");
    const [obj, keysOrFn] = args;
    if (typeof obj !== "object" || obj === null) {
        throw new BaseError_1.ArgumentsError("First argument to omit must be an object.", [
            `mylang:objects (${__filename})`,
        ]);
    }
    let result = create([
        Object.getPrototypeOf(obj) || null,
        Object.getOwnPropertyDescriptors(obj),
    ]);
    if ((0, utils_1.isFunctionNode)(keysOrFn)) {
        for (const key in obj) {
            if (keysOrFn.evaluate(keysOrFn.parentEnv).call([obj[key], key, obj])) {
                delete result[key];
            }
        }
    }
    else if (Array.isArray(keysOrFn)) {
        for (const key of keysOrFn) {
            delete result[key];
        }
    }
    return result;
}
