"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VariableDeclaration = void 0;
const StmtType_1 = require("../StmtType");
const FunctionExpression_1 = require("../expression/FunctionExpression");
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
        score.create(this.name, this.value.evaluate(score), this.options);
        return score.get(this.name);
    }
}
exports.VariableDeclaration = VariableDeclaration;
