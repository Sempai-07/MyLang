const { SymbolFunction } = require("./Function");

class MethodCall {
  constructor(path, children) {
    this.name = "MethodCall";
    this.path = path;
    this.children = children;
  }

  isAssign(body) {
    return this.variable.path in body.globalScope;
  }

  runFunction(func, node, body) {
    const args = node.children.map((arg) => body.visit(arg));
    const localScope = {};

    for (let i = 0; i < func.params.length; i++) {
      localScope[func.params[i]] = args[i];
    }

    const previousScope = body.globalScope;
    body.globalScope = { ...body.globalScope, ...localScope };
    const result = body.visit(func.body);
    body.globalScope = previousScope;
    return result;
  }

  evaluate(node, body) {
    let current = body.globalScope;
    for (let i = 0; i < this.path.length; i++) {
      if (current[this.path[i]] === undefined) {
        throw new Error(`Undefined property: ${this.path[i]}`);
      }
      current = current[this.path[i]];
    }
    if (typeof current !== "function" && node.children?.length > 0) {
      throw new Error(`${this.path[this.path.length - 1]} is not a function`);
    }
    if (node.children?.length > 0) {
      if (typeof current === "string") {
        return this.runFunction(current, node, body);
      } else if (typeof current === "function") {
        const result = current.call(this.globalScope, node, body);
        if (result?.isFunction === SymbolFunction) {
          return this.runFunction(result, node, body);
        }
        return result;
      } else return current;
    } else return current;
  }
}

module.exports = { MethodCall };
