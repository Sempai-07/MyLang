const { ASTNode } = require("./ast/ASTNode");
const { Program } = require("./ast/Program");
const { BlockStatement } = require("./ast/Block");
const { Identifier } = require("./ast/Identifier");
const { MethodCall } = require("./ast/Keyword/MethodCall");
const { CallExpression } = require("./ast/CallExpression");
const { Parameters } = require("./ast/Parameters");
const { ReturnStatement } = require("./ast/Keyword/Return");
const { NumberLiteral } = require("./ast/Type/Number");
const { StringLiteral } = require("./ast/Type/String");
const { BooleanLiteral } = require("./ast/Type/Boolean");
const { ObjectLiteral } = require("./ast/Type/Object");
const { UndefinedLiteral } = require("./ast/Type/Undefined");
const { FunctionDeclaration } = require("./ast/Keyword/Function");
const { ImportDeclaration } = require("./ast/Keyword/Import");
const { ExportsDeclaration } = require("./ast/Keyword/Exports");
const { VariableDeclaration } = require("./ast/Keyword/Variable");
const { ExpressionStatement } = require("./ast/Utils/Expression");
const { BinaryExpression } = require("./ast/Utils/BinaryOperator");
const { VisitUnaryExpression } = require("./ast/Utils/VisitUnary");

class Interpreter {
  constructor(ast, options = {}) {
    const isMainFunction = ast.children.find((ctx) => {
      return ctx instanceof FunctionDeclaration && ctx.func.value === "main";
    });
    if (!isMainFunction) {
      throw new Error("Missing Entry Point: main function not defined");
    }

    this.ast = ast;
    this.main = options.main;
    this.exports = {};
    this.globalScope = {};
    this.globalExports = options.exports;
  }

  interpret() {
    const index = this.ast.children.push(new CallExpression("main", []));
    this.visit(this.ast);
  }

  visit(node) {
    switch (true) {
      case node instanceof Program:
        this.visitProgram(node);
        break;
      case node instanceof FunctionDeclaration:
        node.evaluate(node, this);
        break;
      case node instanceof MethodCall:
        return node.evaluate(node, this);
      case node instanceof VariableDeclaration:
        node.evaluate(node, this);
        break;
      case node instanceof Parameters:
        return node.evaluate(node, this);
      case node instanceof ImportDeclaration:
        return node.evaluate(node, this);
      case node instanceof ExportsDeclaration:
        this.exports = { ...this.exports, ...node.evaluate(node, this) };
        break;
      case node instanceof CallExpression:
        const { globalScope, result } = node.evaluate(node, this);
        this.globalScope = globalScope.globalScope;
        return result;
      case node instanceof ReturnStatement:
        return node.evaluate(node, this);
      case node instanceof BinaryExpression:
        return node.evaluate(node, this);
      case node instanceof VisitUnaryExpression:
        return node.evaluate(node, this);
      case node instanceof Identifier:
        return node.evaluate(node, this);
      case node instanceof NumberLiteral:
        return node.evaluate(node, this);
      case node instanceof StringLiteral:
        return node.evaluate(node, this);
      case node instanceof BooleanLiteral:
        return node.evaluate(node, this);
      case node instanceof ObjectLiteral:
        return node.evaluate(node, this);
      case node instanceof UndefinedLiteral:
        return node.evaluate(node, this);
      case node instanceof ExpressionStatement:
        return node.evaluate(node, this);
      case node instanceof BlockStatement:
        return node.evaluate(node, this);
      default:
        console.log(node);
        throw new Error(`Unknown AST node type: ${node.type}`);
    }
  }

  visitProgram(node) {
    for (const child of node.children) {
      this.visit(child);
    }
  }
}

module.exports = { Interpreter };
