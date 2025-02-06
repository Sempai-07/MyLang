"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toStr = toStr;
exports.contains = contains;
exports.containsAny = containsAny;
exports.count = count;
exports.fields = fields;
exports.hasPrefix = hasPrefix;
exports.hasSuffix = hasSuffix;
exports.indexOf = indexOf;
exports.join = join;
exports.repeat = repeat;
exports.replace = replace;
exports.split = split;
exports.toLower = toLower;
exports.toUpper = toUpper;
exports.trim = trim;
exports.trimStart = trimStart;
exports.trimEnd = trimEnd;
exports.compare = compare;
const BaseError_1 = require("../../../errors/BaseError");
function ensureArgsCount(args, count, message) {
    if (args.length < count) {
        throw new BaseError_1.ArgumentsError(message, [`mylang:strings (${__filename})`]);
    }
}
function toStr(args) {
    ensureArgsCount(args, 1, "requires at least 1 argument.");
    return args.map(String).join(" ");
}
function contains(args) {
    ensureArgsCount(args, 2, "requires 2 arguments: string and substring.");
    const [s, substr] = args.map(String);
    return (typeof s === "string" && typeof substr === "string" && s.includes(substr));
}
function containsAny(args) {
    ensureArgsCount(args, 2, "requires 2 arguments: string and characters.");
    const [s, chars] = args.map(String);
    return (typeof s === "string" &&
        typeof chars === "string" &&
        [...chars].some((char) => s.includes(char)));
}
function count(args) {
    ensureArgsCount(args, 2, "requires 2 arguments: string and substring.");
    const [s, substr] = args.map(String);
    return typeof s === "string" && typeof substr === "string"
        ? s.split(substr).length - 1
        : 0;
}
function hasPrefix(args) {
    ensureArgsCount(args, 2, "requires 2 arguments: string and prefix.");
    const [s, prefix] = args.map(String);
    return (typeof s === "string" && typeof prefix === "string" && s.startsWith(prefix));
}
function hasSuffix(args) {
    ensureArgsCount(args, 2, "requires 2 arguments: string and suffix.");
    const [s, suffix] = args.map(String);
    return (typeof s === "string" && typeof suffix === "string" && s.endsWith(suffix));
}
function indexOf(args) {
    ensureArgsCount(args, 2, "requires 2 arguments: string and substring.");
    const [s, substr] = args.map(String);
    return typeof s === "string" && typeof substr === "string"
        ? s.indexOf(substr)
        : -1;
}
function replace(args) {
    ensureArgsCount(args, 3, "requires 3 arguments: string, oldSubstr, newSubstr.");
    const [s, oldSubstr, newSubstr] = args.map(String);
    return typeof s === "string" &&
        typeof oldSubstr === "string" &&
        typeof newSubstr === "string"
        ? s.replace(new RegExp(oldSubstr, "g"), newSubstr)
        : "";
}
function split(args) {
    ensureArgsCount(args, 2, "requires 2 arguments: string and separator.");
    const [s, separator] = args.map(String);
    return typeof s === "string" && typeof separator === "string"
        ? s.split(separator)
        : [];
}
function compare(args) {
    ensureArgsCount(args, 2, "requires 2 arguments: string1 and string2.");
    const [s1, s2] = args.map(String);
    return typeof s1 === "string" && typeof s2 === "string"
        ? s1.localeCompare(s2)
        : 0;
}
function fields(args) {
    ensureArgsCount(args, 1, "requires 1 argument: string.");
    return String(args[0]).trim().split(/\s+/);
}
function join(args, score) {
    ensureArgsCount(args, 2, "requires 2 arguments: array and separator.");
    const [array, separator] = [args[0], String(args[1])];
    if (!Array.isArray(array))
        throw new BaseError_1.ArgumentsError("First argument to join must be an array.", score.get("import").paths);
    return array.map(String).join(separator);
}
function repeat(args, score) {
    ensureArgsCount(args, 2, "requires 2 arguments: string and count.");
    const [s, count] = [String(args[0]), Number(args[1])];
    if (isNaN(count) || count < 0)
        throw new BaseError_1.ArgumentsError("repeat requires a non-negative integer count.", score.get("import").paths);
    return s.repeat(count);
}
function toLower(args) {
    ensureArgsCount(args, 1, "requires 1 argument: string.");
    return String(args[0]).toLowerCase();
}
function toUpper(args) {
    ensureArgsCount(args, 1, "requires 1 argument: string.");
    return String(args[0]).toUpperCase();
}
function trim(args) {
    ensureArgsCount(args, 1, "requires 1 argument: string.");
    return String(args[0]).trim();
}
function trimStart(args) {
    ensureArgsCount(args, 1, "requires 1 argument: string.");
    return String(args[0]).trimStart();
}
function trimEnd(args) {
    ensureArgsCount(args, 1, "requires 1 argument: string.");
    return String(args[0]).trimEnd();
}
