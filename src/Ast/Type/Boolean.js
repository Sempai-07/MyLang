class BooleanLiteral {
  constructor(value) {
    this.name = "BooleanLiteral";
    this.value = value;
  }

  evaluate(node, body) {
    return node.value === "true";
  }
}

module.exports = { BooleanLiteral };
