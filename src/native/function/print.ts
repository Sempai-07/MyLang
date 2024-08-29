import type { StmtType } from "../../ast/StmtType";

function print(score: Record<string, any>, ...args: StmtType[]): null {
  const result = [];

  for (const arg of args) {
    result.push(arg.evaluate(score));
  }

  console.log(...result);
  return null;
}

export { print };
