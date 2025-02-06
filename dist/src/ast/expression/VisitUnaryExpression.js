"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisitUnaryExpression = void 0;
const StmtType_1 = require("../StmtType");
const BaseError_1 = require("../../errors/BaseError");
const TokenType_1 = require("../../lexer/TokenType");
class VisitUnaryExpression extends StmtType_1.StmtType {
    operator;
    position;
    right;
    constructor(operator, right, position) {
        super();
        this.operator = operator;
        this.right = right;
        this.position = position;
    }
    evaluate(score) {
        try {
            switch (this.operator) {
                case TokenType_1.OperatorType.Add: {
                    return +this.right.evaluate(score);
                }
                case TokenType_1.OperatorType.Subtract: {
                    return -this.right.evaluate(score);
                }
                case TokenType_1.OperatorType.Not: {
                    return !this.right.evaluate(score);
                }
                default: {
                    throw new BaseError_1.BaseError(`Invalid operator "${this.operator}"`, {
                        files: score.get("import").paths,
                    });
                }
            }
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
exports.VisitUnaryExpression = VisitUnaryExpression;
