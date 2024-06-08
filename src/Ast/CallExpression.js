class CallExpression {
  constructor(value, children) {
    this.name = "CallExpression";
    this.value = value;
    this.children = children;
  }

  evaluate(node, body) {
    const func = body.globalScope[node.value];
    if (!func) {
      throw new Error(`Undefined function: ${node.value}`);
    }
    const args = node.children.map((arg) => body.visit(arg));
    const localScope = {};
    for (let i = 0; i < func.params.length; i++) {
      localScope[func.params[i]] = args[i];
    }
    return this.executeFunction(func.body, localScope, body);
  }

  executeFunction(body, localScope, globalScope) {
    const previousScope = globalScope.globalScope;
    globalScope.globalScope = { ...globalScope.globalScope, ...localScope };
    const result = globalScope.visit(body);
    globalScope.globalScope = previousScope;
    return { globalScope, result };
  }
}

module.exports = { CallExpression };
