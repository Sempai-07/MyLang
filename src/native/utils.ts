import { FunctionDeclaration } from "../ast/declaration/FunctionDeclaration";
import { FunctionExpression } from "../ast/expression/FunctionExpression";

function isFunctionNode(
  node: any,
): node is FunctionDeclaration | FunctionExpression {
  return (
    node &&
    typeof node === "object" &&
    typeof node.evaluate === "function" &&
    (node instanceof FunctionDeclaration || node instanceof FunctionExpression)
  );
}

export { isFunctionNode };
