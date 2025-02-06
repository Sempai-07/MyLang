"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileSync = FileSync;
const tslib_1 = require("tslib");
const node_fs_1 = tslib_1.__importDefault(require("node:fs"));
const index_1 = require("../buffers/index");
const BaseError_1 = require("../../../errors/BaseError");
function FileSync() {
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
    return {
        read([path, options]) {
            validateArgs([path], ["string"]);
            return handleError(() => (0, index_1.BufferWrapper)([
                node_fs_1.default.readFileSync(path, options),
            ]));
        },
        write([path, data, options]) {
            validateArgs([path], ["string"]);
            return handleError(() => node_fs_1.default.writeFileSync(path, data, options || {}));
        },
        append([path, data, options]) {
            validateArgs([path], ["string"]);
            return handleError(() => node_fs_1.default.appendFileSync(path, data, options || {}));
        },
        remove([path]) {
            validateArgs([path], ["string"]);
            return handleError(() => node_fs_1.default.unlinkSync(path));
        },
        stat([path]) {
            validateArgs([path], ["string"]);
            return handleError(() => node_fs_1.default.statSync(path));
        },
        rename([oldPath, newPath]) {
            validateArgs([oldPath, newPath], ["string", "string"]);
            return handleError(() => node_fs_1.default.renameSync(oldPath, newPath));
        },
        list([path, options]) {
            validateArgs([path], ["string"]);
            return handleError(() => node_fs_1.default.readdirSync(path, options || null));
        },
        mkdir([path, options]) {
            validateArgs([path], ["string"]);
            return handleError(() => node_fs_1.default.mkdirSync(path, options || {}));
        },
        rmdir([path, options]) {
            validateArgs([path], ["string"]);
            return handleError(() => node_fs_1.default.rmdirSync(path, options || {}));
        },
        copy([src, dest, flags]) {
            validateArgs([src, dest], ["string", "string"]);
            return handleError(() => node_fs_1.default.copyFileSync(src, dest, flags || 0));
        },
    };
}
