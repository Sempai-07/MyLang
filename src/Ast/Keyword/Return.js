class ReturnStatement {
  constructor(children) {
    this.name = "ReturnStatement";
    this.children = children;
  }

  evaluate(node, body) {
    if (node.children.length > 0) {
      return body.visit(node.children[0]);
    }
    return null;
  }
}

module.exports = { ReturnStatement };
