class Identifier {
  constructor(value) {
    this.name = "Identifier";
    this.value = value;
  }

  evaluate(node, body) {
    if (node.value in body.globalScope) {
      if (body.globalScope[node.value].body) {
        return Function;
      }
      return body.globalScope[node.value];
    }
    throw new Error(`Undefined identifier: ${node.value}`);
  }
}

module.exports = { Identifier };
