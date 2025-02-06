"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileSystem = FileSystem;
const tslib_1 = require("tslib");
const node_fs_1 = tslib_1.__importDefault(require("node:fs"));
const index_1 = require("../buffers/index");
const utils_1 = require("../../utils");
const BaseError_1 = require("../../../errors/BaseError");
function FileSystem() {
    function validatePath(path) {
        if (typeof path !== "string" || path.trim() === "") {
            throw new BaseError_1.ArgumentsError(`Invalid path. Must be a non-empty string.`, [
                `mylang:fs (${__filename})`,
            ]);
        }
    }
    function validateCallback(cb) {
        if (!(0, utils_1.isFunctionNode)(cb)) {
            throw new BaseError_1.FunctionCallError("Invalid callback. Must be a FunctionDeclaration or FunctionExpression.", [`mylang:fs (${__filename})`]);
        }
    }
    return {
        readFile([path, options, cb]) {
            validatePath(path);
            validateCallback(cb);
            const callback = (err, data) => cb.evaluate(cb.parentEnv).call([
                err
                    ? new BaseError_1.BaseError(`${err}`, {
                        files: [`mylang:fs (${__filename})`],
                    })
                    : null,
                (0, index_1.BufferWrapper)([data]),
            ]);
            node_fs_1.default.readFile(path, (options || {}), callback);
        },
        writeFile([path, data, options, cb]) {
            validatePath(path);
            validateCallback(cb);
            const callback = (err) => cb.evaluate(cb.parentEnv).call([
                err
                    ? new BaseError_1.BaseError(`${err}`, {
                        files: [`mylang:fs (${__filename})`],
                    })
                    : null,
            ]);
            node_fs_1.default.writeFile(path, data, (options || {}), callback);
        },
        appendFile([path, data, options, cb]) {
            validatePath(path);
            validateCallback(cb);
            const callback = (err) => cb.evaluate(cb.parentEnv).call([
                err
                    ? new BaseError_1.BaseError(`${err}`, {
                        files: [`mylang:fs (${__filename})`],
                    })
                    : null,
            ]);
            node_fs_1.default.appendFile(path, data, (options || {}), callback);
        },
        readdir([path, options, cb]) {
            validatePath(path);
            validateCallback(cb);
            const callback = (err, files) => cb.evaluate(cb.parentEnv).call([
                err
                    ? new BaseError_1.BaseError(`${err}`, {
                        files: [`mylang:fs (${__filename})`],
                    })
                    : null,
                files,
            ]);
            node_fs_1.default.readdir(path, (options || {}), callback);
        },
        unlink([path, cb]) {
            validatePath(path);
            validateCallback(cb);
            const callback = (err) => cb.evaluate(cb.parentEnv).call([
                err
                    ? new BaseError_1.BaseError(`${err}`, {
                        files: [`mylang:fs (${__filename})`],
                    })
                    : null,
            ]);
            node_fs_1.default.unlink(path, callback);
        },
        stat([path, cb]) {
            validatePath(path);
            validateCallback(cb);
            const callback = (err, stats) => cb.evaluate(cb.parentEnv).call([
                err
                    ? new BaseError_1.BaseError(`${err}`, {
                        files: [`mylang:fs (${__filename})`],
                    })
                    : null,
                stats,
            ]);
            node_fs_1.default.stat(path, callback);
        },
        rename([oldPath, newPath, cb]) {
            validatePath(oldPath);
            validatePath(newPath);
            validateCallback(cb);
            const callback = (err) => cb.evaluate(cb.parentEnv).call([
                err
                    ? new BaseError_1.BaseError(`${err}`, {
                        files: [`mylang:fs (${__filename})`],
                    })
                    : null,
            ]);
            node_fs_1.default.rename(oldPath, newPath, callback);
        },
        mkdir([path, options, cb]) {
            validatePath(path);
            validateCallback(cb);
            const callback = (err) => cb.evaluate(cb.parentEnv).call([
                err
                    ? new BaseError_1.BaseError(`${err}`, {
                        files: [`mylang:fs (${__filename})`],
                    })
                    : null,
            ]);
            node_fs_1.default.mkdir(path, options || {}, callback);
        },
        rmdir([path, options, cb]) {
            validatePath(path);
            validateCallback(cb);
            const callback = (err) => cb.evaluate(cb.parentEnv).call([
                err
                    ? new BaseError_1.BaseError(`${err}`, {
                        files: [`mylang:fs (${__filename})`],
                    })
                    : null,
            ]);
            node_fs_1.default.rmdir(path, options || {}, callback);
        },
        copyFile([src, dest, flags, cb]) {
            validatePath(src);
            validatePath(dest);
            validateCallback(cb);
            const callback = (err) => cb.evaluate(cb.parentEnv).call([
                err
                    ? new BaseError_1.BaseError(`${err}`, {
                        files: [`mylang:fs (${__filename})`],
                    })
                    : null,
            ]);
            node_fs_1.default.copyFile(src, dest, flags || 0, callback);
        },
    };
}
