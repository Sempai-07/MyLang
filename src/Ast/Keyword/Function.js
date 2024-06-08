class FunctionDeclaration {
  constructor(name, children) {
    this.name = "FunctionDeclaration";
    this.func = name;
    this.children = children;
  }

  getName() {
    return this.func;
  }

  evaluate(node, body) {
    const [name, params, parse] = node.children;
    body.globalScope[name.value] = {
      params: params.children.map((param) => param.value),
      body: parse,
      toString: () => name.value,
    };
  }
}

module.exports = { FunctionDeclaration };
