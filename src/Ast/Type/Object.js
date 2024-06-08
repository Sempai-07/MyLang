class ObjectLiteral {
  constructor(value) {
    this.name = "ObjectLiteral";
    this.value = value;
  }

  evaluate(node, body) {
    const obj = {};

    if (!Array.isArray(node.value)) {
      for (const index in node.value) {
        obj[index] = body.visit(node.value[index]);
      }
      return obj;
    } else {
      return node.value.reduce((acc, item) => {
        acc[item.key.value] = body.visit(item.value);
        return acc;
      }, {});
    }
  }
}

module.exports = { ObjectLiteral };
