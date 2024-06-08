class NumberLiteral {
  constructor(value) {
    this.name = "NumberLiteral";
    this.value = value;
  }

  evaluate(node, body) {
    return Number(node.value);
  }
}

module.exports = { NumberLiteral };
