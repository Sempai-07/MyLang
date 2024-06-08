class ExpressionStatement {
  constructor(children) {
    this.name = "ExpressionStatement";
    this.children = children;
  }

  evaluate(node, body) {
    return body.visit(node.children[0]);
  }
}

module.exports = { ExpressionStatement };
