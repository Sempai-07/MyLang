"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CombinedVariableDeclaration = void 0;
const StmtType_1 = require("../StmtType");
const IdentifierLiteral_1 = require("../types/IdentifierLiteral");
const FunctionExpression_1 = require("../expression/FunctionExpression");
const BaseError_1 = require("../../errors/BaseError");
class CombinedVariableDeclaration extends StmtType_1.StmtType {
    value;
    options;
    position;
    constructor(value, options, position) {
        super();
        this.value = value;
        this.options = options;
        this.position = position;
    }
    evaluate(score) {
        for (const { name, value, options } of this.value) {
            if (value instanceof FunctionExpression_1.FunctionExpression) {
                value.name = name;
            }
            if (value instanceof IdentifierLiteral_1.IdentifierLiteral &&
                score.optionsVar[value.value]?.readonly) {
                if (options && score.optionsVar[value.value]) {
                    throw new BaseError_1.AssignmentError(`Cannot assign const or readonly to variable "${value.value}" because it is already const/readonly`, {
                        code: "ASSIGNMENT_VAR_READONLY_OR_CONST",
                        files: score.get("import").paths,
                    });
                }
            }
            if (this.options) {
                score.create(name, value.evaluate(score), this.options);
            }
            else {
                score.create(name, value.evaluate(score), options);
            }
        }
    }
}
exports.CombinedVariableDeclaration = CombinedVariableDeclaration;
