class UndefinedLiteral {
  constructor(value) {
    this.name = "UndefinedLiteral";
    this.value = value;
  }

  evaluate(node, body) {
    return undefined;
  }
}

module.exports = { UndefinedLiteral };
