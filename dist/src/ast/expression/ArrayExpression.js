"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArrayExpression = void 0;
const StmtType_1 = require("../StmtType");
const BaseError_1 = require("../../errors/BaseError");
class ArrayExpression extends StmtType_1.StmtType {
    elements;
    position;
    constructor(elements, position) {
        super();
        this.elements = elements;
        this.position = position;
    }
    evaluate(score) {
        try {
            const result = [];
            for (let element of this.elements) {
                result.push(element.evaluate(score));
            }
            return result;
        }
        catch (err) {
            if (err instanceof BaseError_1.BaseError) {
                err.files = Array.from(new Set([score.get("import").main, ...err.files])).map((file) => {
                    if (file === score.get("import").main) {
                        return `Array(${file}:${this.position.line}:${this.position.column})`;
                    }
                    return file;
                });
            }
            throw err;
        }
    }
}
exports.ArrayExpression = ArrayExpression;
