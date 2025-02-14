"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitWarning = emitWarning;
class CustomWarning extends Error {
    code;
    constructor(message, name = "Warning", code) {
        super(message);
        this.name = name;
        if (code)
            this.code = code;
        Error.captureStackTrace(this, CustomWarning);
    }
}
const handlers = [];
function emitWarning(message, options = {}) {
    const { name = "Warning", code } = options;
    const warning = new CustomWarning(message, name, code);
    handlers.forEach((h) => h(warning));
    console.warn(`\x1b[33m${warning.name}: ${warning.message}${code ? ` [${code}]` : ""}\x1b[0m`);
}
emitWarning.on = (handler) => handlers.push(handler);
emitWarning.off = (handler) => {
    const index = handlers.indexOf(handler);
    if (index !== -1)
        handlers.splice(index, 1);
};
