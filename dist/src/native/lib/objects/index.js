"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assign = assign;
exports.create = create;
exports.defineProperty = defineProperty;
exports.defineProperties = defineProperties;
exports.entries = entries;
exports.freeze = freeze;
exports.fromEntries = fromEntries;
exports.getOwnPropertyNames = getOwnPropertyNames;
exports.getPrototypeOf = getPrototypeOf;
exports.is = is;
exports.isExtensible = isExtensible;
exports.isFrozen = isFrozen;
exports.isSealed = isSealed;
exports.keys = keys;
exports.preventExtensions = preventExtensions;
exports.seal = seal;
exports.setPrototypeOf = setPrototypeOf;
exports.values = values;
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
function freeze(args) {
    ensureArgsCount(args, 1, "requires 1 argument: object.");
    return Object.freeze(args[0]);
}
function fromEntries(args) {
    ensureArgsCount(args, 1, "requires 1 argument: iterable.");
    return Object.fromEntries(args[0]);
}
function getOwnPropertyNames(args) {
    ensureArgsCount(args, 1, "requires 1 argument: object.");
    return Object.getOwnPropertyNames(args[0]);
}
function getPrototypeOf(args) {
    ensureArgsCount(args, 1, "requires 1 argument: object.");
    return Object.getPrototypeOf(args[0]);
}
function is(args) {
    ensureArgsCount(args, 2, "requires 2 arguments: value1 and value2.");
    return Object.is(args[0], args[1]);
}
function isExtensible(args) {
    ensureArgsCount(args, 1, "requires 1 argument: object.");
    return Object.isExtensible(args[0]);
}
function isFrozen(args) {
    ensureArgsCount(args, 1, "requires 1 argument: object.");
    return Object.isFrozen(args[0]);
}
function isSealed(args) {
    ensureArgsCount(args, 1, "requires 1 argument: object.");
    return Object.isSealed(args[0]);
}
function keys(args) {
    ensureArgsCount(args, 1, "requires 1 argument: object.");
    return Object.keys(args[0]);
}
function preventExtensions(args) {
    ensureArgsCount(args, 1, "requires 1 argument: object.");
    return Object.preventExtensions(args[0]);
}
function seal(args) {
    ensureArgsCount(args, 1, "requires 1 argument: object.");
    return Object.seal(args[0]);
}
function setPrototypeOf(args) {
    ensureArgsCount(args, 2, "requires 2 arguments: object and prototype.");
    return Object.setPrototypeOf(args[0], args[1]);
}
function values(args) {
    ensureArgsCount(args, 1, "requires 1 argument: object.");
    return Object.values(args[0]);
}
