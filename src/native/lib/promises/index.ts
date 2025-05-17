import { isFunctionNode } from "../../utils";
import { type FunctionDeclaration } from "../../../ast/declaration/FunctionDeclaration";
import { type FunctionExpression } from "../../../ast/expression/FunctionExpression";
import { FunctionCallError } from "../../../errors/BaseError";
import { Task as TaskExucutor } from "../../../runtime/task/Task";

type PromiseLikeValue = {
  call: (args: { value: unknown }[]) => void;
};

function Task([executor]: [FunctionDeclaration | FunctionExpression]) {
  if (!isFunctionNode(executor)) {
    throw new FunctionCallError("Invalid callback function.", [
      `mylang:promises (${__filename})`,
    ]);
  }

  let value: unknown;
  let state: "pending" | "fulfilled" | "rejected" = "pending";

  let thenHandlers: PromiseLikeValue[] = [];
  let catchHandlers: PromiseLikeValue[] = [];
  let finallyHandlers: PromiseLikeValue[] = [];

  function resolve([result]: [unknown]) {
    if (state !== "pending") {
      return;
    }

    state = "fulfilled";
    value = result;

    thenHandlers.forEach((handler) => handler.call([{ value: result }]));
    finallyHandlers.forEach((handler) => handler.call([]));
  }

  function reject([error]: [unknown]) {
    if (state !== "pending") {
      return;
    }

    state = "rejected";
    value = error;

    catchHandlers.forEach((handler) => handler.call([{ value: error }]));
    finallyHandlers.forEach((handler) => handler.call([]));
  }

  executor.call([{ value: resolve }, { value: reject }]);

  return new TaskExucutor(() => {
    return value;
  });
}

function resolve([val]: [unknown]) {
  return new TaskExucutor(() => {
    let value = val;
    return value;
  });
}

function reject([err]: [unknown]) {
  return new TaskExucutor(() => {
    throw err;
  });
}

function is([content]: [unknown]) {
  if (!content) return false;
  return content instanceof TaskExucutor;
}

export { Task, resolve, reject, is };
