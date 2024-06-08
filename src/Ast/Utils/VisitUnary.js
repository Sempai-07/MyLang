class VisitUnaryExpression {
  constructor(value, children) {
    this.name = "VisitUnaryExpression";
    this.value = value;
    this.children = children;
  }

  evaluate(node, body) {
    const [expr] = node.children;
    const value = body.visit(expr);
    switch (node.value) {
      case "-":
        return -value;
      case "!":
        return !value;
      case "+":
        return +value;
      default:
        throw new Error(`Unknown unary operator: ${node.value}`);
    }
  }
}

module.exports = { VisitUnaryExpression };
