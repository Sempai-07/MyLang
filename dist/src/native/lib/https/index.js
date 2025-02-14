"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.request = request;
const tslib_1 = require("tslib");
const node_fs_1 = tslib_1.__importDefault(require("node:fs"));
const request_sync_1 = tslib_1.__importDefault(require("request-sync"));
const BaseError_1 = require("../../../errors/BaseError");
const WarningError_1 = require("../../../errors/WarningError");
(0, WarningError_1.emitWarning)('module "https" is in an experimental state', {
    name: "ModuleExperimental",
    code: "WARN001",
});
function request([url, options]) {
    const config = {
        url,
        ...(typeof options === "string" ? { method: options } : options),
    };
    if (config.body && typeof config.body !== "string") {
        config.body = Buffer.from(config.body?.toJSON().data);
    }
    try {
        const response = (0, request_sync_1.default)(config);
        return {
            statusCode: response.statusCode,
            headers: response.headers,
            body: {
                toJSON() {
                    try {
                        return JSON.parse(response.body.toString("utf8"));
                    }
                    catch (err) {
                        throw new BaseError_1.BaseError(`Failed to parse response body as JSON: ${err}`, {
                            files: [`mylang:https (${__filename})`],
                        });
                    }
                },
                toStr([encoding] = ["utf8"]) {
                    return response.body.toString(encoding);
                },
                toBuffer() {
                    return Buffer.from(response.body);
                },
                saveToFile([filePath]) {
                    node_fs_1.default.writeFileSync(filePath, response.body);
                    return filePath;
                },
                toBinaryString() {
                    return response.body.toString("binary");
                },
                toString() {
                    return `${response.body}`;
                },
            },
        };
    }
    catch (err) {
        throw new BaseError_1.BaseError(`Failed to perform request: ${err}`, {
            files: [`mylang:https (${__filename})`],
        });
    }
}
