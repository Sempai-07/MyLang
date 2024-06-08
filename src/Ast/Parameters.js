class Parameters {
  constructor(children) {
    this.name = "Parameters";
    this.children = children;
  }

  evaluate(node, body) {
    return node.children.map((arg) => body.visit(arg));
  }
}

module.exports = { Parameters };
