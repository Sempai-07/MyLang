"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatMessage = formatMessage;
function formatMessage(message, params) {
    if (!params)
        return message;
    return message.replace(/\${(.*?)}/g, (_, key) => {
        return key in params ? String(params[key]) : `{${key}}`;
    });
}
