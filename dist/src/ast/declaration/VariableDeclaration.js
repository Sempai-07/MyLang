"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VariableDeclaration = void 0;
const StmtType_1 = require("../StmtType");
const IdentifierLiteral_1 = require("../types/IdentifierLiteral");
const FunctionExpression_1 = require("../expression/FunctionExpression");
const BaseError_1 = require("../../errors/BaseError");
class VariableDeclaration extends StmtType_1.StmtType {
    name;
    value;
    options;
    position;
    constructor(name, value, options, position) {
        super();
        this.name = name;
        this.value = value;
        this.options = options;
        this.position = position;
    }
    evaluate(score) {
        if (this.value instanceof FunctionExpression_1.FunctionExpression) {
            this.value.name = this.name;
        }
        if (this.value instanceof IdentifierLiteral_1.IdentifierLiteral &&
            score.optionsVar[this.value.value]?.readonly) {
            if (this.options && score.optionsVar[this.value.value]) {
                throw new BaseError_1.AssignmentError(`Cannot assign const or readonly to variable "${this.value.value}" because it is already const/readonly`, {
                    code: "ASSIGNMENT_VAR_READONLY_OR_CONST",
                    files: score.get("import").paths,
                });
            }
            score.create(this.name, this.value.evaluate(score), {
                ...score.optionsVar[this.value.value],
                constant: false,
            });
        }
        else {
            score.create(this.name, this.value.evaluate(score), this.options);
        }
        return score.get(this.name);
    }
}
exports.VariableDeclaration = VariableDeclaration;
