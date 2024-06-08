class Parameters {
  constructor(children) {
    this.name = "Parameters";
    this.children = children;
  }

  evaluate(node, body) {
    if (!Array.isArray(node.children)) {
      return [body.visit(node.children)];
    }
    return node.children.map((arg) => body.visit(arg));
  }
}

module.exports = { Parameters };
