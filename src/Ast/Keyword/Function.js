const SymbolFunction = Symbol("Function");

class FunctionDeclaration {
  constructor(name, children) {
    this.name = "FunctionDeclaration";
    this.func = name;
    this.children = children;
  }

  evaluate(node, body) {
    const [name, params, parse] = node.children;
    body.globalScope[name.value] = function () {
      return {
        params: params.children.map((param) => param.value),
        isFunction: SymbolFunction,
        body: parse,
      };
    };
  }
}

module.exports = { FunctionDeclaration, SymbolFunction };
