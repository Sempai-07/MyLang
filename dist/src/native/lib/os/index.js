"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.constants = void 0;
exports.platform = platform;
exports.homedir = homedir;
exports.tmpdir = tmpdir;
exports.getEnv = getEnv;
exports.setEnv = setEnv;
exports.cwd = cwd;
exports.userInfo = userInfo;
exports.cpus = cpus;
exports.totalmem = totalmem;
exports.freemem = freemem;
exports.hostname = hostname;
exports.networkInterfaces = networkInterfaces;
const tslib_1 = require("tslib");
const node_os_1 = tslib_1.__importDefault(require("node:os"));
const BaseError_1 = require("../../../errors/BaseError");
function ensureArgsCount(args, count, message) {
    if (args.length < count) {
        throw new BaseError_1.ArgumentsError(message, [`mylang:os (${__filename})`]);
    }
}
function platform() {
    return process.platform;
}
function homedir() {
    return node_os_1.default.homedir();
}
function tmpdir() {
    return node_os_1.default.tmpdir();
}
function getEnv(args) {
    ensureArgsCount(args, 1, "getEnv requires 1 argument: key.");
    const key = String(args[0]);
    return process.env[key];
}
function setEnv(args) {
    ensureArgsCount(args, 2, "setEnv requires 2 arguments: key and value.");
    const [key, value] = [String(args[0]), String(args[1])];
    process.env[key] = value;
}
function cwd() {
    return process.cwd();
}
function userInfo() {
    return node_os_1.default.userInfo();
}
function cpus() {
    return require("os").cpus();
}
function totalmem() {
    return node_os_1.default.totalmem();
}
function freemem() {
    return node_os_1.default.freemem();
}
function hostname() {
    return node_os_1.default.hostname();
}
function networkInterfaces() {
    return node_os_1.default.networkInterfaces();
}
const constants = {
    version: require("../../../../../package.json").version,
    versions: require("../../../../../package.json").dependencies,
    nodejs: {
        version: process.version,
        versions: process.versions,
        release: process.release,
    },
};
exports.constants = constants;
constants.__proto__ = null;
