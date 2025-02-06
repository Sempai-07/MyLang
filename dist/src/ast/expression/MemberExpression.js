"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemberExpression = void 0;
const StmtType_1 = require("../StmtType");
const BaseError_1 = require("../../errors/BaseError");
class MemberExpression extends StmtType_1.StmtType {
    obj;
    property;
    position;
    constructor(obj, property, position) {
        super();
        this.obj = obj;
        this.property = property;
        this.position = position;
    }
    evaluate(score) {
        try {
            const obj = this.obj.evaluate(score);
            const objRef = this.property.evaluate(score);
            if (objRef instanceof StmtType_1.StmtType) {
                const index = objRef.evaluate(score);
                if (typeof index === "number") {
                    return obj[index] === undefined ? null : obj[index];
                }
                return obj[index] === undefined ? null : obj[index];
            }
            if (typeof objRef === "number") {
                return obj[objRef] === undefined ? null : obj[objRef];
            }
            return obj[objRef] === undefined ? null : obj[objRef];
        }
        catch (err) {
            if (err instanceof BaseError_1.BaseError) {
                err.files = Array.from(new Set([score.get("import").main, ...err.files])).map((file) => {
                    if (file === score.get("import").main) {
                        return `${file}:${this.position.line}:${this.position.column}`;
                    }
                    return file;
                });
            }
            throw err;
        }
    }
}
exports.MemberExpression = MemberExpression;
