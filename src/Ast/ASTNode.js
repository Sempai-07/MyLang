class ASTNode {
  constructor(type, value, children = []) {
    this.type = type;
    this.value = value;
    this.children = children;
  }
}

module.exports = { ASTNode };
