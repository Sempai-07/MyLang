class StringLiteral {
  constructor(value) {
    this.name = "StringLiteral";
    this.value = value;
  }

  evaluate(node, body) {
    return node.value;
  }
}

module.exports = { StringLiteral };
