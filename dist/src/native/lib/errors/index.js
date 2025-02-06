"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseError = BaseError;
exports.FileReadFaild = FileReadFaild;
exports.ImportFaildError = ImportFaildError;
exports.AssignmentError = AssignmentError;
exports.FunctionCallError = FunctionCallError;
exports.ArgumentsError = ArgumentsError;
const BaseError_1 = require("../../../errors/BaseError");
function BaseError([message, options = {}]) {
    return new BaseError_1.BaseError(message, {
        files: [`mylang:errors (${__filename})`],
        ...options,
    });
}
function FileReadFaild([message, filePath]) {
    return new BaseError_1.FileReadFaild(message, filePath, [`mylang:errors (${__filename})`]);
}
function ImportFaildError([message, options = {}]) {
    return new BaseError_1.ImportFaildError(message, {
        ...options,
        files: [`mylang:errors (${__filename})`]
    });
}
function AssignmentError([message, options = {}]) {
    return new BaseError_1.AssignmentError(message, {
        ...options,
        files: [`mylang:errors (${__filename})`]
    });
}
function FunctionCallError([message]) {
    return new BaseError_1.FunctionCallError(message, [`mylang:errors (${__filename})`]);
}
function ArgumentsError([message]) {
    return new BaseError_1.ArgumentsError(message, [`mylang:errors (${__filename})`]);
}
