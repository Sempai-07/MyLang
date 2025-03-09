"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileSystem = FileSystem;
const tslib_1 = require("tslib");
const index_1 = require("../buffers/index");
const node_fs_1 = tslib_1.__importDefault(require("node:fs"));
const utils_1 = require("../../utils");
const BaseError_1 = require("../../../errors/BaseError");
function FileSystem() {
    function validateArgs(args, expectedTypes) {
        args.forEach((arg, index) => {
            if (typeof arg !== expectedTypes[index]) {
                throw new BaseError_1.ArgumentsError(`Expected ${expectedTypes[index]}, got ${typeof arg}.`, [`mylang:fs (${__filename})`]);
            }
        });
    }
    function validateCallback(cb) {
        if (!(0, utils_1.isFunctionNode)(cb)) {
            throw new BaseError_1.FunctionCallError("Invalid callback function.", [
                `mylang:fs (${__filename})`,
            ]);
        }
    }
    function handleError(err) {
        return err
            ? new BaseError_1.BaseError(String(err), { files: [`mylang:fs (${__filename})`] })
            : null;
    }
    return {
        read([path, options, cb]) {
            validateArgs([path], ["string"]);
            validateCallback(cb);
            node_fs_1.default.readFile(path, options || {}, (err, data) => cb
                .evaluate(cb.parentEnv)
                .call([{ value: handleError(err) }, { value: (0, index_1.from)([data]) }]));
        },
        write([path, data, options, cb]) {
            validateArgs([path], ["string"]);
            validateCallback(cb);
            node_fs_1.default.writeFile(path, data, options || {}, (err) => cb.evaluate(cb.parentEnv).call([{ value: handleError(err) }]));
        },
        append([path, data, options, cb]) {
            validateArgs([path], ["string"]);
            validateCallback(cb);
            node_fs_1.default.appendFile(path, data, options || {}, (err) => cb.evaluate(cb.parentEnv).call([{ value: handleError(err) }]));
        },
        remove([path, cb]) {
            validateArgs([path], ["string"]);
            validateCallback(cb);
            node_fs_1.default.unlink(path, (err) => cb.evaluate(cb.parentEnv).call([{ value: handleError(err) }]));
        },
        stat([path, cb]) {
            validateArgs([path], ["string"]);
            validateCallback(cb);
            node_fs_1.default.stat(path, (err, stats) => cb
                .evaluate(cb.parentEnv)
                .call([{ value: handleError(err) }, { value: stats }]));
        },
        rename([oldPath, newPath, cb]) {
            validateArgs([oldPath, newPath], ["string", "string"]);
            validateCallback(cb);
            node_fs_1.default.rename(oldPath, newPath, (err) => cb.evaluate(cb.parentEnv).call([{ value: handleError(err) }]));
        },
    };
}
