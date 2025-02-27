"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toBigInt = toBigInt;
exports.add = add;
exports.subtract = subtract;
exports.multiply = multiply;
exports.divide = divide;
exports.mod = mod;
exports.pow = pow;
exports.equals = equals;
exports.greaterThan = greaterThan;
exports.lessThan = lessThan;
exports.abs = abs;
exports.negate = negate;
exports.isZero = isZero;
exports.isPositive = isPositive;
exports.isNegative = isNegative;
exports.toNumberFromBigInt = toNumberFromBigInt;
exports.toSafeNumber = toSafeNumber;
exports.sqrt = sqrt;
exports.log = log;
const BaseError_1 = require("../../../../errors/BaseError");
function ensureArgsCount(args, count, message) {
    if (args.length < count) {
        throw new BaseError_1.ArgumentsError(message, [
            `mylang:numbers/bigint (${__filename})`,
        ]);
    }
}
function toBigInt(value) {
    try {
        return BigInt(value);
    }
    catch (e) {
        throw new BaseError_1.ArgumentsError(`Invalid BigInt value: ${value}`, [
            `mylang:numbers/bigint (${__filename})`,
        ]);
    }
}
function add(args) {
    ensureArgsCount(args, 2, "requires 2 arguments: a and b.");
    const [a, b] = [toBigInt(args[0]), toBigInt(args[1])];
    return a + b;
}
function subtract(args) {
    ensureArgsCount(args, 2, "requires 2 arguments: a and b.");
    const [a, b] = [toBigInt(args[0]), toBigInt(args[1])];
    return a - b;
}
function multiply(args) {
    ensureArgsCount(args, 2, "requires 2 arguments: a and b.");
    const [a, b] = [toBigInt(args[0]), toBigInt(args[1])];
    return a * b;
}
function divide(args) {
    ensureArgsCount(args, 2, "requires 2 arguments: a and b.");
    const [a, b] = [toBigInt(args[0]), toBigInt(args[1])];
    if (b === 0n) {
        throw new BaseError_1.ArgumentsError("Division by zero", [
            `mylang:numbers/bigint (${__filename})`,
        ]);
    }
    return a / b;
}
function mod(args) {
    ensureArgsCount(args, 2, "requires 2 arguments: a and b.");
    const [a, b] = [toBigInt(args[0]), toBigInt(args[1])];
    if (b === 0n) {
        throw new BaseError_1.ArgumentsError("Modulo by zero", [
            `mylang:numbers/bigint (${__filename})`,
        ]);
    }
    return a % b;
}
function pow(args) {
    ensureArgsCount(args, 2, "requires 2 arguments: base and exponent.");
    const [base, exponent] = [toBigInt(args[0]), toBigInt(args[1])];
    if (exponent < 0n) {
        throw new BaseError_1.ArgumentsError("Negative exponents are not supported", [
            `mylang:numbers/bigint (${__filename})`,
        ]);
    }
    return base ** exponent;
}
function equals(args) {
    ensureArgsCount(args, 2, "requires 2 arguments: a and b.");
    const [a, b] = [toBigInt(args[0]), toBigInt(args[1])];
    return a === b;
}
function greaterThan(args) {
    ensureArgsCount(args, 2, "requires 2 arguments: a and b.");
    const [a, b] = [toBigInt(args[0]), toBigInt(args[1])];
    return a > b;
}
function lessThan(args) {
    ensureArgsCount(args, 2, "requires 2 arguments: a and b.");
    const [a, b] = [toBigInt(args[0]), toBigInt(args[1])];
    return a < b;
}
function abs(args) {
    ensureArgsCount(args, 1, "requires 1 argument: value.");
    const value = toBigInt(args[0]);
    return value < 0n ? -value : value;
}
function negate(args) {
    ensureArgsCount(args, 1, "requires 1 argument: value.");
    const value = toBigInt(args[0]);
    return -value;
}
function isZero(args) {
    ensureArgsCount(args, 1, "requires 1 argument: value.");
    const value = toBigInt(args[0]);
    return value === 0n;
}
function isPositive(args) {
    ensureArgsCount(args, 1, "requires 1 argument: value.");
    const value = toBigInt(args[0]);
    return value > 0n;
}
function isNegative(args) {
    ensureArgsCount(args, 1, "requires 1 argument: value.");
    const value = toBigInt(args[0]);
    return value < 0n;
}
function toNumberFromBigInt(args) {
    ensureArgsCount(args, 1, "requires 1 argument: value.");
    const value = toBigInt(args[0]);
    return Number(value);
}
function toSafeNumber(args) {
    ensureArgsCount(args, 1, "requires 1 argument: value.");
    const value = toBigInt(args[0]);
    if (value > BigInt(Number.MAX_SAFE_INTEGER) ||
        value < BigInt(Number.MIN_SAFE_INTEGER)) {
        console.warn("Number is outside the safe integer range, precision may be lost.");
    }
    return Number(value);
}
function sqrt(args) {
    ensureArgsCount(args, 1, "requires 1 argument: value.");
    const value = toBigInt(args[0]);
    if (value < 0n) {
        throw new BaseError_1.ArgumentsError("Square root of negative numbers is not supported", [`mylang:numbers/bigint (${__filename})`]);
    }
    return BigInt(Math.floor(Math.sqrt(Number(value))));
}
function log(args) {
    ensureArgsCount(args, 1, "requires 1 argument: value.");
    const value = toBigInt(args[0]);
    if (value <= 0n) {
        throw new BaseError_1.ArgumentsError("Logarithm of non-positive numbers is not supported", [`mylang:numbers/bigint (${__filename})`]);
    }
    return Math.log(Number(value));
}
