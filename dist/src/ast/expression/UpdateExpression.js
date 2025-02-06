"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateExpression = void 0;
const StmtType_1 = require("../StmtType");
const BaseError_1 = require("../../errors/BaseError");
const TokenType_1 = require("../../lexer/TokenType");
class UpdateExpression extends StmtType_1.StmtType {
    operator;
    argument;
    position;
    constructor(argument, operator, position) {
        super();
        this.argument = argument;
        this.operator = operator;
        this.position = position;
    }
    evaluate(score) {
        try {
            let currentValue;
            try {
                currentValue = this.argument.evaluate(score);
            }
            catch (err) {
                throw String(err);
            }
            if (typeof currentValue !== "number") {
                throw new BaseError_1.BaseError("Update expression only work on number", {
                    files: score.get("import").paths,
                });
            }
            let nextValue = currentValue;
            switch (this.operator) {
                case TokenType_1.OperatorType.PlusPlus:
                    nextValue += 1;
                    break;
                case TokenType_1.OperatorType.MinusMinus:
                    nextValue -= 1;
                    break;
                default:
                    throw new BaseError_1.BaseError(`Unrecognized operator ${this.operator}`, {
                        files: score.get("import").paths,
                    });
            }
            score.update(this.argument.value, nextValue);
            return currentValue;
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
exports.UpdateExpression = UpdateExpression;
