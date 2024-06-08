class BlockStatement {
  constructor(children) {
    this.name = "BlockStatement";
    this.children = children;
  }

  evaluate(node, body) {
    let result;
    for (const child of node.children) {
      result = body.visit(child);
    }
    return result;
  }
}

module.exports = { BlockStatement };
