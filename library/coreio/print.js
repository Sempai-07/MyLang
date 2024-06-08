function print(node, body) {
  const result = [];
  for (const children of node.children) {
    const param = body.visit(children);
    if (Array.isArray(param)) {
      result.push(...body.visit(children));
    } else result.push(body.visit(children));
  }
  console.log(...result);
}

module.exports = { print };
