"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exec = exec;
exports.execSync = execSync;
const tslib_1 = require("tslib");
const node_child_process_1 = tslib_1.__importDefault(require("node:child_process"));
const index_1 = require("../../buffers/index");
const utils_1 = require("../../../utils");
const BaseError_1 = require("../../../../errors/BaseError");
const WarningError_1 = require("../../../../errors/WarningError");
(0, WarningError_1.emitWarning)('module "os/exec" is in an experimental state', {
    name: "ModuleExperimental",
    code: "WARN001",
});
function ensureArgsCount(args, count, message) {
    if (args.length < count) {
        throw new BaseError_1.ArgumentsError(message, [`mylang:os/exec (${__filename})`]);
    }
}
function handleError(err) {
    return err ? new BaseError_1.BaseError(String(err), { files: [] }) : null;
}
function exec(args) {
    ensureArgsCount(args, 1, "requires at 1 argument.");
    const [command, options, callback] = args;
    if (options) {
        if ((0, utils_1.isFunctionNode)(options) && !callback) {
            const callCallback = (...args) => options.evaluate(options.parentEnv).call([
                { value: handleError(args[0]) },
                {
                    value: typeof args[1] === "string" ? args[1] : (0, index_1.from)([args[1]]),
                },
                {
                    value: typeof args[2] === "string" ? args[2] : (0, index_1.from)([args[2]]),
                },
            ]);
            node_child_process_1.default.exec(command, callCallback);
            return;
        }
        if ((0, utils_1.isFunctionNode)(callback)) {
            const callCallback = (...args) => callback.evaluate(callback.parentEnv).call([
                { value: handleError(args[0]) },
                {
                    value: typeof args[1] === "string" ? args[1] : (0, index_1.from)([args[1]]),
                },
                {
                    value: typeof args[2] === "string" ? args[2] : (0, index_1.from)([args[2]]),
                },
            ]);
            node_child_process_1.default.exec(command, options, callCallback);
            return;
        }
    }
    node_child_process_1.default.exec(command);
    return;
}
function execSync(args) {
    ensureArgsCount(args, 1, "requires at 1 argument.");
    const [command, options] = args;
    const result = node_child_process_1.default.execSync(command, options);
    return typeof result === "string" ? result : (0, index_1.from)([result]);
}
