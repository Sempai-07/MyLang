class ExportsDeclaration {
  constructor(children) {
    this.name = "ExportsDeclaration";
    this.children = children;
  }

  evaluate(node, body) {
    return body.visit(node.children);
  }
}

module.exports = { ExportsDeclaration };
