class CallExpression {
  constructor(value, children) {
    this.name = "CallExpression";
    this.value = value;
    this.children = children;
  }

  evaluate(node, body) {
    const func = body.globalScope[node.value];
    if (!func || typeof func !== "function") {
      throw new Error(`Undefined function: ${node.value}`);
    }
    const args = node.children.map((arg) => body.visit(arg));
    const localScope = {};
    const callFunction = func();
    for (let i = 0; i < callFunction.params.length; i++) {
      localScope[callFunction.params[i]] = args[i];
    }
    return this.executeFunction(callFunction.body, localScope, body);
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
