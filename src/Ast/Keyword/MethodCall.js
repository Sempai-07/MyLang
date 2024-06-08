class MethodCall {
  constructor(value, children) {
    this.name = "MethodCall";
    this.value = value;
    this.children = children;
  }

  isAssign(body) {
    return this.variable.value in body.globalScope;
  }

  evaluate(node, body) {
    const [lib, method] = node.value;
    if (node.children?.length > 0) {
      const func = body.globalScope[lib][method];
      if (typeof func === "function") {
        return func(node, body);
      } else throw new Error(`Undefined function: ${method}`);
    }
    return body.globalScope[lib][method];
  }
}

module.exports = { MethodCall };
