import type { FunctionDeclaration } from "../../ast/function/FunctionDeclaration";

function parseArguments(
  func: FunctionDeclaration,
  score: Record<string, any>,
  evaluatedArgs: any[],
) {
  for (let i = 0; i < func.params.length; i++) {
    if (!evaluatedArgs[i] && func.params[i][1]) {
      score[func.params[i][0]] = func.params[i][1].evaluate(score);
      continue;
    }
    score[func.params[i][0]] = evaluatedArgs[i];
  }
  return score;
}

export { parseArguments };
