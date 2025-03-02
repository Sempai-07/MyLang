"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = create;
exports.concat = concat;
exports.copyWithin = copyWithin;
exports.every = every;
exports.fill = fill;
exports.filter = filter;
exports.find = find;
exports.findIndex = findIndex;
exports.flat = flat;
exports.flatMap = flatMap;
exports.forEach = forEach;
exports.includes = includes;
exports.indexOf = indexOf;
exports.join = join;
exports.lastIndexOf = lastIndexOf;
exports.map = map;
exports.pop = pop;
exports.push = push;
exports.reduce = reduce;
exports.reduceRight = reduceRight;
exports.reverse = reverse;
exports.shift = shift;
exports.slice = slice;
exports.some = some;
exports.sort = sort;
exports.splice = splice;
exports.unshift = unshift;
exports.count = count;
const utils_1 = require("../../utils");
const BaseError_1 = require("../../../errors/BaseError");
function ensureArgsCount(args, count, message) {
    if (args.length < count) {
        throw new BaseError_1.ArgumentsError(message, [`mylang:arrays (${__filename})`]);
    }
}
function create(args) {
    return new Array(args[0] || 0).fill(args[1] === undefined ? null : args[1]);
}
function concat(args) {
    ensureArgsCount(args, 2, "concat requires at least 2 arguments: array and values.");
    return args[0].concat(...args.slice(1));
}
function copyWithin(args) {
    ensureArgsCount(args, 3, "copyWithin requires 3 arguments: array, target, and start.");
    const [array, target, start, end] = args;
    return array.copyWithin(target, start, end);
}
function every(args) {
    ensureArgsCount(args, 2, "every requires 2 arguments: array and callback.");
    const [array, callback] = args;
    if (!(0, utils_1.isFunctionNode)(callback)) {
        throw new BaseError_1.FunctionCallError("Invalid callback. Must be a FunctionDeclaration or FunctionExpression.", [`mylang:arrays (${__filename})`]);
    }
    const callCallback = (...args) => callback
        .evaluate(callback.parentEnv)
        .call(args.map((value) => ({ value })));
    return array.every(callCallback);
}
function fill(args) {
    ensureArgsCount(args, 2, "fill requires at least 2 arguments: array and value.");
    const [array, value, start, end] = args;
    return array.fill(value, start, end);
}
function filter(args) {
    ensureArgsCount(args, 2, "filter requires 2 arguments: array and callback.");
    const [array, callback] = args;
    if (!(0, utils_1.isFunctionNode)(callback)) {
        throw new BaseError_1.FunctionCallError("Invalid callback. Must be a FunctionDeclaration or FunctionExpression.", [`mylang:arrays (${__filename})`]);
    }
    const callCallback = (...args) => callback
        .evaluate(callback.parentEnv)
        .call(args.map((value) => ({ value })));
    return array.filter(callCallback);
}
function find(args) {
    ensureArgsCount(args, 2, "find requires 2 arguments: array and callback.");
    const [array, callback] = args;
    if (!(0, utils_1.isFunctionNode)(callback)) {
        throw new BaseError_1.FunctionCallError("Invalid callback. Must be a FunctionDeclaration or FunctionExpression.", [`mylang:arrays (${__filename})`]);
    }
    const callCallback = (...args) => callback
        .evaluate(callback.parentEnv)
        .call(args.map((value) => ({ value })));
    return array.find(callCallback);
}
function findIndex(args) {
    ensureArgsCount(args, 2, "findIndex requires 2 arguments: array and callback.");
    const [array, callback] = args;
    if (!(0, utils_1.isFunctionNode)(callback)) {
        throw new BaseError_1.FunctionCallError("Invalid callback. Must be a FunctionDeclaration or FunctionExpression.", [`mylang:arrays (${__filename})`]);
    }
    const callCallback = (...args) => callback
        .evaluate(callback.parentEnv)
        .call(args.map((value) => ({ value })));
    return array.findIndex(callCallback);
}
function flat(args) {
    ensureArgsCount(args, 1, "flat requires at least 1 argument: array.");
    const [array, depth] = args;
    return array.flat(depth);
}
function flatMap(args) {
    ensureArgsCount(args, 2, "flatMap requires 2 arguments: array and callback.");
    const [array, callback] = args;
    if (!(0, utils_1.isFunctionNode)(callback)) {
        throw new BaseError_1.FunctionCallError("Invalid callback. Must be a FunctionDeclaration or FunctionExpression.", [`mylang:arrays (${__filename})`]);
    }
    const callCallback = (...args) => callback
        .evaluate(callback.parentEnv)
        .call(args.map((value) => ({ value })));
    return array.flatMap(callCallback);
}
function forEach(args) {
    ensureArgsCount(args, 2, "forEach requires 2 arguments: array and callback.");
    const [array, callback] = args;
    if (!(0, utils_1.isFunctionNode)(callback)) {
        throw new BaseError_1.FunctionCallError("Invalid callback. Must be a FunctionDeclaration or FunctionExpression.", [`mylang:arrays (${__filename})`]);
    }
    const callCallback = (...args) => callback
        .evaluate(callback.parentEnv)
        .call(args.map((value) => ({ value })));
    array.forEach(callCallback);
}
function includes(args) {
    ensureArgsCount(args, 2, "includes requires at least 2 arguments: array and value.");
    const [array, value, start] = args;
    return array.includes(value, start);
}
function indexOf(args) {
    ensureArgsCount(args, 2, "indexOf requires 2 arguments: array and value.");
    const [array, value, start] = args;
    return array.indexOf(value, start);
}
function join(args) {
    ensureArgsCount(args, 1, "join requires at least 1 argument: array.");
    const [array, separator] = args;
    return array.join(separator);
}
function lastIndexOf(args) {
    ensureArgsCount(args, 2, "lastIndexOf requires 2 arguments: array and value.");
    const [array, value, start] = args;
    if (!start) {
        return array.lastIndexOf(value);
    }
    return array.lastIndexOf(value, start);
}
function map(args) {
    ensureArgsCount(args, 2, "map requires 2 arguments: array and callback.");
    const [array, callback] = args;
    if (!(0, utils_1.isFunctionNode)(callback)) {
        throw new BaseError_1.FunctionCallError("Invalid callback. Must be a FunctionDeclaration or FunctionExpression.", [`mylang:arrays (${__filename})`]);
    }
    const callCallback = (...args) => callback
        .evaluate(callback.parentEnv)
        .call(args.map((value) => ({ value })));
    return array.map(callCallback);
}
function pop(args) {
    ensureArgsCount(args, 1, "pop requires 1 argument: array.");
    return args[0].pop();
}
function push(args) {
    ensureArgsCount(args, 2, "push requires at least 2 arguments: array and values.");
    return args[0].push(...args.slice(1));
}
function reduce(args) {
    ensureArgsCount(args, 2, "reduce requires at least 2 arguments: array and callback.");
    const [array, callback, initialValue] = args;
    if (!(0, utils_1.isFunctionNode)(callback)) {
        throw new BaseError_1.FunctionCallError("Invalid callback. Must be a FunctionDeclaration or FunctionExpression.", [`mylang:arrays (${__filename})`]);
    }
    const callCallback = (...args) => callback
        .evaluate(callback.parentEnv)
        .call(args.map((value) => ({ value })));
    return array.reduce(callCallback, initialValue);
}
function reduceRight(args) {
    ensureArgsCount(args, 2, "reduceRight requires at least 2 arguments: array and callback.");
    const [array, callback, initialValue] = args;
    if (!(0, utils_1.isFunctionNode)(callback)) {
        throw new BaseError_1.FunctionCallError("Invalid callback. Must be a FunctionDeclaration or FunctionExpression.", [`mylang:arrays (${__filename})`]);
    }
    const callCallback = (...args) => callback
        .evaluate(callback.parentEnv)
        .call(args.map((value) => ({ value })));
    return array.reduceRight(callCallback, initialValue);
}
function reverse(args) {
    ensureArgsCount(args, 1, "reverse requires 1 argument: array.");
    return args[0].reverse();
}
function shift(args) {
    ensureArgsCount(args, 1, "shift requires 1 argument: array.");
    return args[0].shift();
}
function slice(args) {
    ensureArgsCount(args, 1, "slice requires at least 1 argument: array.");
    const [array, start, end] = args;
    return array.slice(start, end);
}
function some(args) {
    ensureArgsCount(args, 2, "some requires 2 arguments: array and callback.");
    const [array, callback] = args;
    if (!(0, utils_1.isFunctionNode)(callback)) {
        throw new BaseError_1.FunctionCallError("Invalid callback. Must be a FunctionDeclaration or FunctionExpression.", [`mylang:arrays (${__filename})`]);
    }
    const callCallback = (...args) => callback
        .evaluate(callback.parentEnv)
        .call(args.map((value) => ({ value })));
    return array.some(callCallback);
}
function sort(args) {
    ensureArgsCount(args, 1, "sort requires at least 1 argument: array.");
    const [array, compareFn] = args;
    if (!compareFn) {
        return array.sort();
    }
    if (!(0, utils_1.isFunctionNode)(compareFn)) {
        throw new BaseError_1.FunctionCallError("Invalid callback. Must be a FunctionDeclaration or FunctionExpression.", [`mylang:arrays (${__filename})`]);
    }
    const callCallback = (...args) => compareFn
        .evaluate(compareFn.parentEnv)
        .call(args.map((value) => ({ value })));
    return array.sort(callCallback);
}
function splice(args) {
    ensureArgsCount(args, 1, "splice requires at least 1 argument: array.");
    const [array, start, deleteCount, ...items] = args;
    return array.splice(start, deleteCount, ...items);
}
function unshift(args) {
    ensureArgsCount(args, 2, "unshift requires at least 2 arguments: array and values.");
    return args[0].unshift(...args.slice(1));
}
function count(args) {
    ensureArgsCount(args, 1, "unshift requires at least 1 arguments: array.");
    return args[0].length;
}
