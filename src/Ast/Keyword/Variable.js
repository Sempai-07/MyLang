class VariableDeclaration {
  constructor(variable, children) {
    this.name = "VariableDeclaration";
    this.variable = variable;
    this.children = children;
  }

  isAssign(body) {
    return this.variable.value in body.globalScope;
  }

  evaluate(node, body) {
    if (this.isAssign(body)) {
      const [{ children }] = node.children;
      if (!children) {
        body.globalScope[this.variable.value] = node.children.map((arg) =>
          body.visit(arg),
        );
        return;
      }
      body.globalScope[this.variable.value] = children.map((arg) =>
        body.visit(arg),
      );
      return;
    }
    const [initializer] = node.children;
    body.globalScope[this.variable.value] = body.visit(initializer);
  }
}

module.exports = { VariableDeclaration };
