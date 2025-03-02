"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyntaxMessageError = exports.SyntaxCodeError = exports.SyntaxError = void 0;
const utils_1 = require("../utils");
const BaseError_1 = require("./BaseError");
var SyntaxCodeError;
(function (SyntaxCodeError) {
    SyntaxCodeError["InvalidUnexpectedToken"] = "INVALID_UNEXPECTED_TOKEN";
    SyntaxCodeError["MultipleConsecutiveQuotes"] = "MULTIPLE_CONSECUTIVE_QUOTES";
    SyntaxCodeError["UnterminatedStringLiteral"] = "UNTERMINATED_STRING_LITERAL";
    SyntaxCodeError["UnexpectedOperator"] = "UNEXPECTED_OPERATOR";
    SyntaxCodeError["ExpectedToken"] = "EXPECTED_TOKEN";
    SyntaxCodeError["Unexpected"] = "UNEXPECTED";
    SyntaxCodeError["InvalidDynamicImportUsage"] = "INVALID_DYNAMIC_IMPORT_USAGE";
    SyntaxCodeError["MissingCatchOrTry"] = "MISSING_CATCH_OR_TRY";
    SyntaxCodeError["ValidAwait"] = "VALID_AWAIT";
    SyntaxCodeError["RestInvalid"] = "REST_INVALID";
    SyntaxCodeError["AlreadyAsInvalid"] = "ALREADY_AS_INVALID";
})(SyntaxCodeError || (exports.SyntaxCodeError = SyntaxCodeError = {}));
const SyntaxMessageError = {
    [SyntaxCodeError.InvalidUnexpectedToken]: "Invalid or unexpected token at ${line}:${column}",
    [SyntaxCodeError.MultipleConsecutiveQuotes]: "Multiple consecutive quotes at ${line}:${column}",
    [SyntaxCodeError.UnterminatedStringLiteral]: "Unterminated string literal starting at ${line}:${column}",
    [SyntaxCodeError.UnexpectedOperator]: "Unexpected operator '${operator}' at ${line}:${column}",
    [SyntaxCodeError.ExpectedToken]: "Expected ${expectedTokenType} but found ${foundTokenType} at ${line}:${column}",
    [SyntaxCodeError.Unexpected]: "Unexpected token '${value}' at ${line}:${column}",
    [SyntaxCodeError.InvalidDynamicImportUsage]: "Invalid use of import() at ${line}:${column}",
    [SyntaxCodeError.MissingCatchOrTry]: "Missing catch or finally after try at ${line}:${column}",
    [SyntaxCodeError.ValidAwait]: "await is only valid in async functions at ${line}:${column}",
    [SyntaxCodeError.RestInvalid]: "Rest parameter must be last formal parameter at ${line}:${column}",
    [SyntaxCodeError.AlreadyAsInvalid]: "Cannot assign type ${currentAsType} because the variable '${name}' is already of type ${varType} at ${line}:${column}",
};
exports.SyntaxMessageError = SyntaxMessageError;
class SyntaxError extends BaseError_1.BaseError {
    constructor(code, format) {
        super(format
            ? (0, utils_1.formatMessage)(SyntaxMessageError[code], format)
            : SyntaxMessageError[code], {
            code,
            name: "SyntaxError",
        });
    }
}
exports.SyntaxError = SyntaxError;
