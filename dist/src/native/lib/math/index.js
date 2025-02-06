"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.abs = abs;
exports.ceil = ceil;
exports.floor = floor;
exports.round = round;
exports.max = max;
exports.min = min;
exports.pow = pow;
exports.sqrt = sqrt;
exports.random = random;
exports.sin = sin;
exports.cos = cos;
exports.tan = tan;
exports.asin = asin;
exports.acos = acos;
exports.atan = atan;
exports.atan2 = atan2;
exports.log = log;
exports.exp = exp;
exports.sign = sign;
exports.trunc = trunc;
const BaseError_1 = require("../../../errors/BaseError");
function ensureArgsCount(args, count, message) {
    if (args.length < count) {
        throw new BaseError_1.ArgumentsError(message, [`mylang:math (${__filename})`]);
    }
}
function toNumber(value) {
    const num = Number(value);
    if (isNaN(num))
        throw new BaseError_1.ArgumentsError(`Invalid number: ${value}`, [
            `mylang:math (${__filename})`,
        ]);
    return num;
}
function abs(args) {
    ensureArgsCount(args, 1, "requires 1 argument: number.");
    return Math.abs(toNumber(args[0]));
}
function ceil(args) {
    ensureArgsCount(args, 1, "requires 1 argument: number.");
    return Math.ceil(toNumber(args[0]));
}
function floor(args) {
    ensureArgsCount(args, 1, "requires 1 argument: number.");
    return Math.floor(toNumber(args[0]));
}
function round(args) {
    ensureArgsCount(args, 1, "requires 1 argument: number.");
    return Math.round(toNumber(args[0]));
}
function max(args) {
    if (!args.length)
        throw new BaseError_1.ArgumentsError("requires at least 1 argument.", [
            `mylang:math (${__filename})`,
        ]);
    return Math.max(...args.map(toNumber));
}
function min(args) {
    if (!args.length)
        throw new BaseError_1.ArgumentsError("requires at least 1 argument.", [
            `mylang:math (${__filename})`,
        ]);
    return Math.min(...args.map(toNumber));
}
function pow(args) {
    ensureArgsCount(args, 2, "requires 2 arguments: base and exponent.");
    return Math.pow(toNumber(args[0]), toNumber(args[1]));
}
function sqrt(args) {
    ensureArgsCount(args, 1, "requires 1 argument: number.");
    return Math.sqrt(toNumber(args[0]));
}
function random() {
    return Math.random();
}
function sin(args) {
    ensureArgsCount(args, 1, "requires 1 argument: angle in radians.");
    return Math.sin(toNumber(args[0]));
}
function cos(args) {
    ensureArgsCount(args, 1, "requires 1 argument: angle in radians.");
    return Math.cos(toNumber(args[0]));
}
function tan(args) {
    ensureArgsCount(args, 1, "requires 1 argument: angle in radians.");
    return Math.tan(toNumber(args[0]));
}
function asin(args) {
    ensureArgsCount(args, 1, "requires 1 argument: number.");
    return Math.asin(toNumber(args[0]));
}
function acos(args) {
    ensureArgsCount(args, 1, "requires 1 argument: number.");
    return Math.acos(toNumber(args[0]));
}
function atan(args) {
    ensureArgsCount(args, 1, "requires 1 argument: number.");
    return Math.atan(toNumber(args[0]));
}
function atan2(args) {
    ensureArgsCount(args, 2, "requires 2 arguments: y and x.");
    return Math.atan2(toNumber(args[0]), toNumber(args[1]));
}
function log(args) {
    ensureArgsCount(args, 1, "requires 1 argument: number.");
    return Math.log(toNumber(args[0]));
}
function exp(args) {
    ensureArgsCount(args, 1, "requires 1 argument: number.");
    return Math.exp(toNumber(args[0]));
}
function sign(args) {
    ensureArgsCount(args, 1, "requires 1 argument: number.");
    return Math.sign(toNumber(args[0]));
}
function trunc(args) {
    ensureArgsCount(args, 1, "requires 1 argument: number.");
    return Math.trunc(toNumber(args[0]));
}
