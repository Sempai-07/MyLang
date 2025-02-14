"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.join = join;
exports.basename = basename;
exports.extname = extname;
exports.dirname = dirname;
exports.normalize = normalize;
exports.resolve = resolve;
exports.parse = parse;
exports.format = format;
exports.isAbsolute = isAbsolute;
exports.relative = relative;
const tslib_1 = require("tslib");
const node_path_1 = tslib_1.__importDefault(require("node:path"));
const BaseError_1 = require("../../../errors/BaseError");
function ensureArgsCount(args, count, message) {
    if (args.length < count) {
        throw new BaseError_1.ArgumentsError(message, [`mylang:path (${__filename})`]);
    }
}
function join(args) {
    ensureArgsCount(args, 1, "join requires at least 1 argument: path segments.");
    return node_path_1.default.join(...args);
}
function basename(args) {
    ensureArgsCount(args, 1, "basename requires at least 1 argument: path.");
    return args[1] ? node_path_1.default.basename(args[0], args[1]) : node_path_1.default.basename(args[0]);
}
function extname(args) {
    ensureArgsCount(args, 1, "extname requires at least 1 argument: path.");
    return node_path_1.default.extname(args[0]);
}
function dirname(args) {
    ensureArgsCount(args, 1, "dirname requires at least 1 argument: path.");
    return node_path_1.default.dirname(args[0]);
}
function normalize(args) {
    ensureArgsCount(args, 1, "normalize requires at least 1 argument: path.");
    return node_path_1.default.normalize(args[0]);
}
function resolve(args) {
    ensureArgsCount(args, 1, "resolve requires at least 1 argument: path.");
    return node_path_1.default.resolve(...args);
}
function parse(args) {
    ensureArgsCount(args, 1, "parse requires at least 1 argument: path.");
    return node_path_1.default.parse(args[0]);
}
function format(args) {
    ensureArgsCount(args, 1, "format requires at least 1 argument: path object.");
    return node_path_1.default.format(args[0]);
}
function isAbsolute(args) {
    ensureArgsCount(args, 1, "isAbsolute requires at least 1 argument: path.");
    return node_path_1.default.isAbsolute(args[0]);
}
function relative(args) {
    ensureArgsCount(args, 2, "relative requires 2 arguments: from and to paths.");
    return node_path_1.default.relative(args[0], args[1]);
}
