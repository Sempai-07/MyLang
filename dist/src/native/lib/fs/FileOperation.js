"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileOperation = FileOperation;
const tslib_1 = require("tslib");
const node_fs_1 = tslib_1.__importDefault(require("node:fs"));
const index_1 = require("../buffers/index");
const BaseError_1 = require("../../../errors/BaseError");
function FileOperation() {
    let fd = null;
    let filePath = null;
    function validateArgs(args, expectedTypes) {
        args.forEach((arg, index) => {
            if (typeof arg !== expectedTypes[index]) {
                throw new BaseError_1.ArgumentsError(`Expected ${expectedTypes[index]}, got ${typeof arg}.`, [`mylang:fs (${__filename})`]);
            }
        });
    }
    function handleError(fn) {
        try {
            return fn();
        }
        catch (err) {
            throw new BaseError_1.BaseError(String(err), {
                files: [`mylang:fs (${__filename})`],
            });
        }
    }
    function ensureOpen() {
        if (fd === null) {
            throw new BaseError_1.BaseError("File is not open.", {
                files: [`mylang:fs (${__filename})`],
            });
        }
    }
    return {
        open([path, flags, mode]) {
            validateArgs([path, flags], ["string", "string"]);
            filePath = path;
            fd = handleError(() => node_fs_1.default.openSync(path, flags, mode));
        },
        close() {
            if (fd !== null) {
                handleError(() => node_fs_1.default.closeSync(fd));
                fd = null;
                filePath = null;
            }
        },
        write([data]) {
            ensureOpen();
            handleError(() => node_fs_1.default.writeSync(fd, typeof data === "string" ? Buffer.from(data) : data));
        },
        read([length, position]) {
            ensureOpen();
            const buffer = Buffer.alloc(length);
            return handleError(() => {
                node_fs_1.default.readSync(fd, buffer, 0, length, position);
                return (0, index_1.from)([buffer]);
            });
        },
        fsync() {
            ensureOpen();
            handleError(() => node_fs_1.default.fsyncSync(fd));
        },
        truncate([length]) {
            if (!filePath)
                throw new BaseError_1.BaseError("File is not open.", {
                    files: [`mylang:fs (${__filename})`],
                });
            handleError(() => node_fs_1.default.truncateSync(filePath, length));
        },
        chmod([mode]) {
            if (!filePath)
                throw new BaseError_1.BaseError("File is not open.", {
                    files: [`mylang:fs (${__filename})`],
                });
            handleError(() => node_fs_1.default.chmodSync(filePath, mode));
        },
        chown([uid, gid]) {
            if (!filePath)
                throw new BaseError_1.BaseError("File is not open.", {
                    files: [`mylang:fs (${__filename})`],
                });
            handleError(() => node_fs_1.default.chownSync(filePath, uid, gid));
        },
    };
}
