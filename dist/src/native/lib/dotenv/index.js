"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DotEnv = DotEnv;
exports.config = config;
const tslib_1 = require("tslib");
const node_path_1 = tslib_1.__importDefault(require("node:path"));
const node_fs_1 = require("node:fs");
const BaseError_1 = require("../../../errors/BaseError");
function DotEnv(args, score) {
    const envMap = new Map();
    return {
        load([files]) {
            if (typeof files === "string") {
                this._loadFile(files);
            }
            else if (Array.isArray(files)) {
                files.forEach((file) => this._loadFile(file));
            }
            else {
                throw new BaseError_1.ArgumentsError(`Must be a string or array of strings.`, [
                    `mylang:dotenv (${__filename})`,
                ]);
            }
        },
        _loadFile(file) {
            if (typeof file !== "string" || file.trim() === "") {
                throw new BaseError_1.ArgumentsError(`Must be a non-empty string.`, [
                    `mylang:dotenv (${__filename})`,
                ]);
            }
            const fullPath = node_path_1.default.join(score.get("import").base, file);
            if (!(0, node_fs_1.existsSync)(fullPath)) {
                throw new BaseError_1.FileReadFaild(`File not found: "${file}".`, fullPath, [
                    `mylang:dotenv (${__filename})`,
                ]);
            }
            const content = (0, node_fs_1.readFileSync)(fullPath, "utf-8");
            const lines = content.split(/\r?\n/);
            lines.forEach((line) => {
                const trimmedLine = line.trim();
                if (trimmedLine === "" || trimmedLine.startsWith("#"))
                    return;
                const [key, ...valueParts] = trimmedLine.split("=");
                const keyTrimmed = key?.trim();
                const value = valueParts
                    .join("=")
                    .trim()
                    .replace(/^['"]|['"]$/g, "");
                if (!keyTrimmed || !value) {
                    throw new BaseError_1.FileReadFaild(`Invalid format in .env file: "${line}". Must be in "KEY=VALUE" format.`, fullPath, [`mylang:dotenv (${__filename})`]);
                }
                envMap.set(keyTrimmed, value);
            });
        },
        get([key]) {
            if (typeof key !== "string" || key.trim() === "") {
                throw new BaseError_1.ArgumentsError(`Must be a non-empty string.`, [
                    `mylang:dotenv (${__filename})`,
                ]);
            }
            return envMap.get(key);
        },
        set([key, value]) {
            if (typeof key !== "string" || key.trim() === "") {
                throw new BaseError_1.ArgumentsError(`Must be a non-empty string.`, [
                    `mylang:dotenv (${__filename})`,
                ]);
            }
            if (typeof value !== "string") {
                throw new BaseError_1.ArgumentsError(`Invalid value for key "${key}". Must be a string.`, [`mylang:dotenv (${__filename})`]);
            }
            envMap.set(key, value);
        },
        unset([key]) {
            if (typeof key !== "string" || key.trim() === "") {
                throw new BaseError_1.ArgumentsError(`Invalid key: "${key}". Must be a non-empty string.`, [`mylang:dotenv (${__filename})`]);
            }
            if (!envMap.has(key)) {
                throw new BaseError_1.ArgumentsError(`Key "${key}" does not exist in the environment.`, [`mylang:dotenv (${__filename})`]);
            }
            envMap.delete(key);
        },
        has([key]) {
            if (typeof key !== "string" || key.trim() === "") {
                throw new BaseError_1.ArgumentsError(`Invalid key: "${key}". Must be a non-empty string.`, [`mylang:dotenv (${__filename})`]);
            }
            return envMap.has(key);
        },
        all() {
            const result = {};
            for (const [key, value] of envMap) {
                result[key] = value;
            }
            return result;
        },
        applyToProcess([override = false]) {
            if (typeof override !== "boolean") {
                throw new BaseError_1.ArgumentsError(`Invalid override value: "${override}". Must be a boolean.`, [`mylang:dotenv (${__filename})`]);
            }
            for (const [key, value] of envMap) {
                if (!process.env[key] || override) {
                    process.env[key] = value;
                }
            }
        },
        config([files, override = false]) {
            this.load([files]);
            this.applyToProcess([override]);
        },
    };
}
function config([files, override = false], score) {
    return DotEnv([], score).config([files, override]);
}
