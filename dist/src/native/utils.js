"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFunctionNode = isFunctionNode;
const FunctionDeclaration_1 = require("../ast/declaration/FunctionDeclaration");
const FunctionExpression_1 = require("../ast/expression/FunctionExpression");
function isFunctionNode(node) {
    return (node &&
        typeof node === "object" &&
        typeof node.evaluate === "function" &&
        (node instanceof FunctionDeclaration_1.FunctionDeclaration || node instanceof FunctionExpression_1.FunctionExpression));
}
