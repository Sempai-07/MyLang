"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignmentExpression = void 0;
const StmtType_1 = require("../StmtType");
const TokenType_1 = require("../../lexer/TokenType");
const BaseError_1 = require("../../errors/BaseError");
const IdentifierLiteral_1 = require("../types/IdentifierLiteral");
const MemberExpression_1 = require("../expression/MemberExpression");
const FunctionExpression_1 = require("../expression/FunctionExpression");
const BaseError_2 = require("../../errors/BaseError");
const Environment_1 = require("../../Environment");
class AssignmentExpression extends StmtType_1.StmtType {
    left;
    right;
    assignType;
    position;
    constructor(left, assignType, right, position) {
        super();
        this.left = left;
        this.assignType = assignType;
        this.right = right;
        this.position = position;
    }
    evaluate(score) {
        try {
            if (!(this.left instanceof IdentifierLiteral_1.IdentifierLiteral) &&
                !(this.left instanceof MemberExpression_1.MemberExpression)) {
                throw new BaseError_1.AssignmentError("left-hand must be identifer or member access expression", {
                    code: "ASSIGNMENT_INVALID_TYPE",
                    files: score.get("import").paths,
                });
            }
            if (this.left instanceof IdentifierLiteral_1.IdentifierLiteral) {
                if (this.left.evaluate(score)?.[Environment_1.Environment.SymbolEnum]) {
                    throw new BaseError_1.AssignmentError(`Cannot assign to '${this.left.value}' because it is an enum`, {
                        code: "ASSIGNMENT_ENUM_CONST",
                        files: score.get("import").paths,
                    });
                }
                else if (score.optionsVar[this.left.value]?.constant) {
                    throw new BaseError_1.AssignmentError(`Assignment to '${this.left.value}' constant variable`, {
                        code: "ASSIGNMENT_VAR_CONST",
                        files: score.get("import").paths,
                    });
                }
                const rightValue = this.right.evaluate(score);
                switch (this.assignType) {
                    case TokenType_1.TokenType.OperatorAssign:
                        if (rightValue instanceof FunctionExpression_1.FunctionExpression) {
                            rightValue.name = this.left.value;
                        }
                        if (this.right instanceof IdentifierLiteral_1.IdentifierLiteral) {
                            score.update(this.left.value, rightValue, {
                                ...score.optionsVar[this.right.value],
                                constant: false,
                            });
                            break;
                        }
                        score.update(this.left.value, rightValue, {
                            constant: false,
                            readonly: false,
                        });
                        break;
                    case TokenType_1.TokenType.OperatorAssignPlus:
                        score.update(this.left.value, this.left.evaluate(score) + rightValue);
                        break;
                    case TokenType_1.TokenType.OperatorAssignMinus:
                        score.update(this.left.value, this.left.evaluate(score) - rightValue);
                        break;
                    default:
                        throw new BaseError_1.AssignmentError(`Invalid Operator: ${this.assignType}`, {
                            code: "ASSIGNMENT_INVALID_OPERATOR",
                            files: score.get("import").paths,
                        });
                }
            }
            else if (this.left instanceof MemberExpression_1.MemberExpression) {
                const value = this.left.obj.evaluate(score);
                if (value?.[Environment_1.Environment.SymbolEnum] ||
                    score.optionsVar[this.left.obj.value]?.readonly) {
                    const property = "value" in this.left.property
                        ? this.left.property.value
                        : this.left.obj.value;
                    if (!Number.isNaN(Number(property))) {
                        throw new BaseError_1.AssignmentError(`Index signature in type '${property}' only permits reading`, {
                            code: "ASSIGNMENT_VAR_READONLY",
                            files: score.get("import").paths,
                        });
                    }
                    else {
                        throw new BaseError_1.AssignmentError(`Cannot assign to '${property}' because it is a read-only property`, {
                            code: "ASSIGNMENT_VAR_READONLY",
                            files: score.get("import").paths,
                        });
                    }
                }
                try {
                    switch (this.assignType) {
                        case TokenType_1.TokenType.OperatorAssign:
                            value[this.left.property.evaluate(score)] =
                                this.right.evaluate(score);
                            break;
                        case TokenType_1.TokenType.OperatorAssignPlus:
                            value[this.left.property.evaluate(score)] +=
                                this.right.evaluate(score);
                            break;
                        case TokenType_1.TokenType.OperatorAssignMinus:
                            value[this.left.property.evaluate(score)] -=
                                this.right.evaluate(score);
                            break;
                    }
                }
                catch (err) {
                    throw new BaseError_1.AssignmentError(`Invalid: ${err}`, {
                        code: "ASSIGNMENT_INVALID",
                        files: score.get("import").paths,
                    });
                }
            }
        }
        catch (err) {
            if (err instanceof BaseError_2.BaseError) {
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
exports.AssignmentExpression = AssignmentExpression;
