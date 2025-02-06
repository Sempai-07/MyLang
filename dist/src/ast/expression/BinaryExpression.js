"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BinaryExpression = void 0;
const node_assert_1 = require("node:assert");
const StmtType_1 = require("../StmtType");
const TokenType_1 = require("../../lexer/TokenType");
const BaseError_1 = require("../../errors/BaseError");
function deepEqualTry(actual, expected) {
    try {
        (0, node_assert_1.deepEqual)(actual, expected);
        return true;
    }
    catch {
        return false;
    }
}
class BinaryExpression extends StmtType_1.StmtType {
    operator;
    position;
    left;
    right;
    constructor(operator, left, right, position) {
        super();
        this.operator = operator;
        this.left = left;
        this.right = right;
        this.position = position;
    }
    evaluate(score) {
        try {
            const left = this.left.evaluate(score);
            switch (this.operator) {
                case TokenType_1.OperatorType.Add: {
                    return left + this.right.evaluate(score);
                }
                case TokenType_1.OperatorType.Subtract: {
                    return left - this.right.evaluate(score);
                }
                case TokenType_1.OperatorType.Multiply: {
                    return left * this.right.evaluate(score);
                }
                case TokenType_1.OperatorType.Modulo: {
                    return left % this.right.evaluate(score);
                }
                case TokenType_1.OperatorType.Divide: {
                    return left / this.right.evaluate(score);
                }
                case TokenType_1.OperatorType.Equal: {
                    return deepEqualTry(left, this.right.evaluate(score));
                }
                case TokenType_1.OperatorType.NotEqual: {
                    return !deepEqualTry(left, this.right.evaluate(score));
                }
                case TokenType_1.OperatorType.GreaterThan: {
                    return left > this.right.evaluate(score);
                }
                case TokenType_1.OperatorType.LessThan: {
                    return left < this.right.evaluate(score);
                }
                case TokenType_1.OperatorType.GreaterThanOrEqual: {
                    return left >= this.right.evaluate(score);
                }
                case TokenType_1.OperatorType.LessThanOrEqual: {
                    return left <= this.right.evaluate(score);
                }
                case TokenType_1.OperatorType.LogicalAnd: {
                    return left & this.right.evaluate(score);
                }
                case TokenType_1.OperatorType.And: {
                    return left && this.right.evaluate(score);
                }
                case TokenType_1.OperatorType.LogicalOr: {
                    return left | this.right.evaluate(score);
                }
                case TokenType_1.OperatorType.Or: {
                    return left || this.right.evaluate(score);
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
exports.BinaryExpression = BinaryExpression;
