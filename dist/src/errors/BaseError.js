"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArgumentsError = exports.FunctionCallError = exports.AssignmentError = exports.ImportFaildError = exports.FileReadFaild = exports.BaseError = void 0;
class BaseError extends Error {
    name;
    cause;
    code;
    files;
    constructor(message, { name = "BaseError", cause, code, files } = {}) {
        super(message);
        this.name = name;
        if (cause)
            this.cause = cause;
        if (code)
            this.code = code;
        this.files = files || [];
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
    toString() {
        const filesOutput = this.files
            ? `\n${this.files.map((value) => ` - ${value}`).join("\n")}`
            : "";
        let causeOutput = "";
        if (this.cause && typeof this.cause === "object") {
            causeOutput = "cause: {\n";
            for (const [key, value] of Object.entries(this.cause)) {
                causeOutput += `    ${key}: ${JSON.stringify(value)}\n`;
            }
            causeOutput += "  }";
        }
        const codeOutput = this.code ? `code: ${this.code}` : "";
        return (`${this.name}: ${this.message}` +
            `${filesOutput} ` +
            (codeOutput || causeOutput
                ? `{\n` +
                    `  ${codeOutput}${codeOutput && causeOutput ? ",\n" : ""}` +
                    `  ${causeOutput}\n` +
                    `}`
                : ""));
    }
}
exports.BaseError = BaseError;
class FileReadFaild extends BaseError {
    constructor(description, filePath, files) {
        super(description, {
            name: "FileReadFaildError",
            code: "FILE_READ_FAILD",
            cause: { filePath },
            files,
        });
    }
}
exports.FileReadFaild = FileReadFaild;
class ImportFaildError extends BaseError {
    constructor(description, options) {
        super(description, {
            name: "ImportFaildError",
            ...(options.code && { code: options.code }),
            ...(options.cause && { cause: options.cause }),
            files: options.files,
        });
    }
}
exports.ImportFaildError = ImportFaildError;
class AssignmentError extends BaseError {
    constructor(description, options) {
        super(description, {
            name: "AssignmentError",
            ...(options.code && { code: options.code }),
            ...(options.cause && { cause: options.cause }),
            files: options.files,
        });
    }
}
exports.AssignmentError = AssignmentError;
class FunctionCallError extends BaseError {
    constructor(description, files) {
        super(description, {
            name: "FunctionCallError",
            files,
        });
    }
}
exports.FunctionCallError = FunctionCallError;
class ArgumentsError extends BaseError {
    constructor(description, files) {
        super(description, {
            name: "ArgumentsError",
            files,
        });
    }
}
exports.ArgumentsError = ArgumentsError;
