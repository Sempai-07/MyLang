"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectExpression = void 0;
const StmtType_1 = require("../StmtType");
const IdentifierLiteral_1 = require("../types/IdentifierLiteral");
const StringLiteral_1 = require("../types/StringLiteral");
const FunctionExpression_1 = require("../expression/FunctionExpression");
const BaseError_1 = require("../../errors/BaseError");
const index_1 = require("../../native/lib/iter/index");
class ObjectExpression extends StmtType_1.StmtType {
    position;
    properties;
    constructor(properties, position) {
        super();
        this.properties = properties;
        this.position = position;
    }
    evaluate(score) {
        try {
            let result = {};
            for (const property of this.properties) {
                if (property.key instanceof IdentifierLiteral_1.IdentifierLiteral &&
                    !property.computed &&
                    property.value) {
                    if (property.value instanceof FunctionExpression_1.FunctionExpression) {
                        property.value.name = property.key.value;
                    }
                    result[property.key.value] = property.value.evaluate(score);
                }
                else if (property.key instanceof IdentifierLiteral_1.IdentifierLiteral &&
                    property.computed &&
                    property.value) {
                    result[property.key.evaluate(score)] = property.value.evaluate(score);
                }
                else if (typeof property.key === "string" && property.value) {
                    if (property.value instanceof FunctionExpression_1.FunctionExpression) {
                        property.value.name = property.key;
                    }
                    result[property.key] = property.value.evaluate(score);
                }
                else {
                    if (property.key instanceof StringLiteral_1.StringLiteral &&
                        property.value instanceof FunctionExpression_1.FunctionExpression) {
                        property.value.name = (property.key).value;
                    }
                    const key = property.key.evaluate(score);
                    if (key === index_1.symbol) {
                        Object.defineProperty(result, key, {
                            value: property.value.evaluate(score),
                            enumerable: true,
                            configurable: true,
                            writable: false,
                        });
                    }
                    else {
                        result[String(key)] =
                            property.value.evaluate(score);
                    }
                }
            }
            return result;
        }
        catch (err) {
            if (err instanceof BaseError_1.BaseError) {
                err.files = Array.from(new Set([score.get("import").main, ...err.files])).map((file) => {
                    if (file === score.get("import").main) {
                        return `Object (${file}:${this.position.line}:${this.position.column})`;
                    }
                    return file;
                });
            }
            throw err;
        }
    }
}
exports.ObjectExpression = ObjectExpression;
