const { ASTNode } = require("./ast/ASTNode");
const { Program } = require("./ast/Program");
const { BlockStatement } = require("./ast/Block");
const { Identifier } = require("./ast/Identifier");
const { Parameters } = require("./ast/Parameters");
const { CallExpression } = require("./ast/CallExpression");
const { NumberLiteral } = require("./ast/Type/Number");
const { StringLiteral } = require("./ast/Type/String");
const { BooleanLiteral } = require("./ast/Type/Boolean");
const { ObjectLiteral } = require("./ast/Type/Object");
const { UndefinedLiteral } = require("./ast/Type/Undefined");
const { ReturnStatement } = require("./ast/Keyword/Return");
const { MethodCall } = require("./ast/Keyword/MethodCall");
const { ImportDeclaration } = require("./ast/Keyword/Import");
const { FunctionDeclaration } = require("./ast/Keyword/Function");
const { VariableDeclaration } = require("./ast/Keyword/Variable");
const { ExpressionStatement } = require("./ast/Utils/Expression");
const { BinaryExpression } = require("./ast/Utils/BinaryOperator");
const { VisitUnaryExpression } = require("./ast/Utils/VisitUnary");

class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.position = 0;
  }

  parse() {
    const program = new Program([]);
    while (!this.eof()) {
      const stmt = this.parseStatement();
      if (stmt) {
        program.children.push(stmt);
      }
    }
    const isMainFunction = program.children.findIndex((ctx) => {
      return (
        ctx instanceof FunctionDeclaration && ctx.getName().value === "main"
      );
    });
    if (isMainFunction === -1) {
      throw new Error("Missing Entry Point: main function not defined");
    }
    return program;
  }

  parseStatement() {
    if (this.eof()) return null;
    const token = this.peek();
    switch (token.name) {
      case "Identifier":
      case "Undefined":
      case "Number":
      case "String":
      case "Boolean":
      case "Operator":
        return this.parseExpressionStatement();
      case "Keyword":
        return this.parseKeywordStatement();
      default:
        throw new SyntaxError(
          `Unexpected token: ${token ? token.name : "EOF"}`,
        );
    }
  }

  parseExpressionStatement() {
    const expr = this.parseExpression();
    if (this.match("Operator", ";")) {
      this.next();
      return new ExpressionStatement([expr]);
    }
    return new ExpressionStatement([expr]);
  }

  parseExpression(precedence = 0) {
    let left = this.parsePrimary();
    while (!this.eof()) {
      const token = this.peek();
      if (token.name !== "BinaryOperator" && token.name !== "Operator") break;

      const tokenPrecedence = this.getPrecedence(token);
      if (tokenPrecedence < precedence) break;

      this.next();
      const right = this.parseExpression(tokenPrecedence + 1);
      left = new BinaryExpression(token.value, [left, right]);
    }
    return left;
  }

  parseObject() {
    const result = [];
    while (!this.match("Operator", "}")) {
      if (this.match("Identifier") || this.match("String")) {
        const key = this.expect(["Identifier", "String"]);
        if (!this.match("Operator", ":") && key.name === "Identifier") {
          result.push({
            key: new StringLiteral(key.value),
            value: new Identifier(key.value),
          });
          continue;
        }
        this.expect("Operator", ":");
        result.push({
          key: new StringLiteral(key.value),
          value: this.parsePrimary(),
        });
      }
      if (this.match("Operator", ",")) {
        this.next();
      }
    }
    return new ObjectLiteral(result);
  }

  parsePrimary() {
    if (this.eof()) throw new SyntaxError("Unexpected end of input");

    const token = this.next();
    switch (token.name) {
      case "Number":
        return new NumberLiteral(token.value);
      case "String":
        return new StringLiteral(token.value);
      case "Boolean":
        return new BooleanLiteral(token.value);
      case "Identifier":
        if (this.match("Operator", "(")) {
          return this.parseFunctionCall(token);
        } else if (this.match("Operator", ".")) {
          return this.parseMethodCall(token);
        } else if (this.match("BinaryOperator", "=")) {
          return new VariableDeclaration(this.last(), [this.parseExpression()]);
        }
        return new Identifier(token.value);
      case "UnaryOperator":
        return this.parseUnaryOperator(token);
      case "BinaryOperator":
        return this.parseExpression(this.getPrecedence(token));
      case "Operator":
        if (token.value === "(") {
          const expr = this.parseExpression();
          this.expect("Operator", ")");
          return expr;
        } else if (token.value === "{") {
          const expr = this.parseObject();
          this.expect("Operator", "}");
          return expr;
        } else return;
        break;
      default:
        throw new SyntaxError(`Unexpected token: ${token.name}`);
    }
  }

  parseUnaryOperator(token) {
    const expr = this.parsePrimary();
    return new VisitUnaryExpression(token.value, [expr]);
  }

  parseKeywordStatement() {
    const token = this.next();
    switch (token.value) {
      case "var":
        return this.parseVariableDeclaration();
      case "func":
        return this.parseFunctionDeclaration();
      case "import":
        return this.parseImportDeclaration();
      case "return":
        return this.parseReturnDeclaration();
      default:
        throw new SyntaxError(`Unexpected keyword: ${token.value}`);
    }
  }

  parseVariableDeclaration() {
    const identifier = this.expect("Identifier");
    if (!this.match("BinaryOperator", "=")) {
      this.expect("Operator", ";");
      return new VariableDeclaration(identifier, [
        new UndefinedLiteral("undefined"),
      ]);
    }
    this.expect("BinaryOperator", "=");
    const initializer = this.parseExpression();
    this.expect("Operator", ";");
    return new VariableDeclaration(identifier, [initializer]);
  }

  parseImportDeclaration() {
    const params = [];
    if (this.match("String")) {
      return new ImportDeclaration([new Parameters(this.peek())]);
    }
    this.expect("Operator", "(");
    while (!this.match("Operator", ")")) {
      if (this.match("Identifier")) {
        const variable = this.expect("Identifier");
        this.expect("Operator", ":");
        params.push(
          new ObjectLiteral(
            {
              variable: new StringLiteral(variable.value),
              lib: this.parsePrimary(),
            },
            variable.position,
          ),
        );
      } else params.push(this.parsePrimary());
      if (this.match("Operator", ",")) {
        this.next();
      }
    }
    this.expect("Operator", ")");
    this.expect("Operator", ";");
    return new ImportDeclaration([new Parameters(params)]);
  }

  parseFunctionDeclaration() {
    const name = this.expect("Identifier");
    this.expect("Operator", "(");
    const params = this.parseParameters();
    this.expect("Operator", ")");
    this.expect("Operator", "{");
    const body = this.parseBlock();
    this.expect("Operator", "}");
    return new FunctionDeclaration(name, [name, params, body]);
  }

  parseFunctionCall(identifierToken) {
    this.expect("Operator", "(");
    const args = [];
    while (!this.match("Operator", ")")) {
      args.push(this.parseExpression());
      if (this.match("Operator", ",")) {
        this.next();
      }
    }
    this.expect("Operator", ")");
    return new CallExpression(identifierToken.value, args);
  }

  parseMethodCall(identifierToken) {
    this.expect("Operator", ".");
    const method = this.expect("Identifier");
    if (this.match("Operator", "(")) {
      this.expect("Operator", "(");
      const args = [];
      while (!this.match("Operator", ")")) {
        args.push(this.parseExpression());
        if (this.match("Operator", ",")) {
          this.next();
        }
      }
      this.expect("Operator", ")");
      return new MethodCall([identifierToken.value, method.value], args);
    } else {
      return new MethodCall([identifierToken.value, method.value], null);
    }
  }

  parseReturnDeclaration() {
    const expr = this.match("Operator", ";") ? null : this.parseExpression();
    this.expect("Operator", ";");
    return new ReturnStatement(expr ? [expr] : []);
  }

  parseParameters() {
    const params = [];
    while (!this.match("Operator", ")")) {
      params.push(this.expect("Identifier"));
      if (this.match("Operator", ",")) {
        this.next();
      }
    }
    return new Parameters(params);
  }

  parseBlock() {
    const statements = [];
    while (!this.match("Operator", "}")) {
      statements.push(this.parseStatement());
    }
    return new BlockStatement(statements);
  }

  getPrecedence(token) {
    if (!token) return -1;
    switch (token.value) {
      case "=":
      case ">":
      case "<":
      case "==":
      case "!=":
      case ">=":
      case "<=":
        return 1;
      case "+":
      case "-":
        return 2;
      case "*":
      case "/":
        return 3;
      default:
        return -1;
    }
  }

  last() {
    return this.tokens[this.position - 1];
  }

  peek() {
    return this.tokens[this.position];
  }

  next() {
    return this.tokens[this.position++];
  }

  expect(names, values = null) {
    const token = this.next();
    if (!Array.isArray(names)) {
      names = [names];
    }
    if (values && !Array.isArray(values)) {
      values = [values];
    }

    const nameMatch = names.includes(token.name);
    const valueMatch = values === null || values.includes(token.value);
    if (!nameMatch || !valueMatch) {
      const expectedNames = names.join(" or ");
      const expectedValues = values ? values.join(" or ") : "";
      const got = `${token.name} ${token.value}`;
      throw new SyntaxError(
        `Expected ${expectedNames} ${expectedValues ? expectedValues : ""}, but got ${got}`,
      );
    }
    return token;
  }

  match(name, value = null) {
    const token = this.peek();
    return token?.name === name && (!value || token.value === value);
  }

  eof() {
    return this.position >= this.tokens.length;
  }
}

module.exports = { Parser };
