import { isFunctionNode } from "../../utils";
import { ArgumentsError, FunctionCallError } from "../../../errors/BaseError";

function ensureArgsCount(args: any[], count: number, message: string): void {
  if (args.length < count) {
    throw new ArgumentsError(message, [`mylang:arrays (${__filename})`]);
  }
}

function create(args: any[]): any[] {
  return new Array(args[0] || 0).fill(args[1] === undefined ? null : args[1]);
}

function concat(args: any[]): any[] {
  ensureArgsCount(
    args,
    2,
    "concat requires at least 2 arguments: array and values.",
  );
  return args[0].concat(...args.slice(1));
}

function copyWithin(args: any[]): any[] {
  ensureArgsCount(
    args,
    3,
    "copyWithin requires 3 arguments: array, target, and start.",
  );
  const [array, target, start, end] = args;
  return array.copyWithin(target, start, end);
}

function every(args: any[]): boolean {
  ensureArgsCount(args, 2, "every requires 2 arguments: array and callback.");
  const [array, callback] = args;

  if (!isFunctionNode(callback)) {
    throw new FunctionCallError(
      "Invalid callback. Must be a FunctionDeclaration or FunctionExpression.",
      [`mylang:arrays (${__filename})`],
    );
  }

  const callCallback = (...args: any[]) =>
    callback.evaluate(callback.parentEnv).call(args);

  return array.every(callCallback);
}

function fill(args: any[]): any[] {
  ensureArgsCount(
    args,
    2,
    "fill requires at least 2 arguments: array and value.",
  );
  const [array, value, start, end] = args;
  return array.fill(value, start, end);
}

function filter(args: any[]): any[] {
  ensureArgsCount(args, 2, "filter requires 2 arguments: array and callback.");
  const [array, callback] = args;

  if (!isFunctionNode(callback)) {
    throw new FunctionCallError(
      "Invalid callback. Must be a FunctionDeclaration or FunctionExpression.",
      [`mylang:arrays (${__filename})`],
    );
  }

  const callCallback = (...args: any[]) =>
    callback.evaluate(callback.parentEnv).call(args);

  return array.filter(callCallback);
}

function find(args: any[]): any {
  ensureArgsCount(args, 2, "find requires 2 arguments: array and callback.");
  const [array, callback] = args;

  if (!isFunctionNode(callback)) {
    throw new FunctionCallError(
      "Invalid callback. Must be a FunctionDeclaration or FunctionExpression.",
      [`mylang:arrays (${__filename})`],
    );
  }

  const callCallback = (...args: any[]) =>
    callback.evaluate(callback.parentEnv).call(args);

  return array.find(callCallback);
}

function findIndex(args: any[]): number {
  ensureArgsCount(
    args,
    2,
    "findIndex requires 2 arguments: array and callback.",
  );
  const [array, callback] = args;

  if (!isFunctionNode(callback)) {
    throw new FunctionCallError(
      "Invalid callback. Must be a FunctionDeclaration or FunctionExpression.",
      [`mylang:arrays (${__filename})`],
    );
  }

  const callCallback = (...args: any[]) =>
    callback.evaluate(callback.parentEnv).call(args);

  return array.findIndex(callCallback);
}

function flat(args: any[]): any[] {
  ensureArgsCount(args, 1, "flat requires at least 1 argument: array.");
  const [array, depth] = args;
  return array.flat(depth);
}

function flatMap(args: any[]): any[] {
  ensureArgsCount(args, 2, "flatMap requires 2 arguments: array and callback.");
  const [array, callback] = args;

  if (!isFunctionNode(callback)) {
    throw new FunctionCallError(
      "Invalid callback. Must be a FunctionDeclaration or FunctionExpression.",
      [`mylang:arrays (${__filename})`],
    );
  }

  const callCallback = (...args: any[]) =>
    callback.evaluate(callback.parentEnv).call(args);

  return array.flatMap(callCallback);
}

function forEach(args: any[]): void {
  ensureArgsCount(args, 2, "forEach requires 2 arguments: array and callback.");
  const [array, callback] = args;

  if (!isFunctionNode(callback)) {
    throw new FunctionCallError(
      "Invalid callback. Must be a FunctionDeclaration or FunctionExpression.",
      [`mylang:arrays (${__filename})`],
    );
  }

  const callCallback = (...args: any[]) =>
    callback.evaluate(callback.parentEnv).call(args);

  array.forEach(callCallback);
}

function includes(args: any[]): boolean {
  ensureArgsCount(
    args,
    2,
    "includes requires at least 2 arguments: array and value.",
  );
  const [array, value, start] = args;
  return array.includes(value, start);
}

function indexOf(args: any[]): number {
  ensureArgsCount(args, 2, "indexOf requires 2 arguments: array and value.");
  const [array, value, start] = args;
  return array.indexOf(value, start);
}

function join(args: any[]): string {
  ensureArgsCount(args, 1, "join requires at least 1 argument: array.");
  const [array, separator] = args;
  return array.join(separator);
}

function lastIndexOf(args: any[]): number {
  ensureArgsCount(
    args,
    2,
    "lastIndexOf requires 2 arguments: array and value.",
  );
  const [array, value, start] = args;

  if (!start) {
    return array.lastIndexOf(value);
  }

  return array.lastIndexOf(value, start);
}

function map(args: any[]): any[] {
  ensureArgsCount(args, 2, "map requires 2 arguments: array and callback.");
  const [array, callback] = args;

  if (!isFunctionNode(callback)) {
    throw new FunctionCallError(
      "Invalid callback. Must be a FunctionDeclaration or FunctionExpression.",
      [`mylang:arrays (${__filename})`],
    );
  }

  const callCallback = (...args: any[]) =>
    callback.evaluate(callback.parentEnv).call(args);

  return array.map(callCallback);
}

function pop(args: any[]): any {
  ensureArgsCount(args, 1, "pop requires 1 argument: array.");
  return args[0].pop();
}

function push(args: any[]): number {
  ensureArgsCount(
    args,
    2,
    "push requires at least 2 arguments: array and values.",
  );
  return args[0].push(...args.slice(1));
}

function reduce(args: any[]): any {
  ensureArgsCount(
    args,
    2,
    "reduce requires at least 2 arguments: array and callback.",
  );
  const [array, callback, initialValue] = args;

  if (!isFunctionNode(callback)) {
    throw new FunctionCallError(
      "Invalid callback. Must be a FunctionDeclaration or FunctionExpression.",
      [`mylang:arrays (${__filename})`],
    );
  }

  const callCallback = (...args: any[]) =>
    callback.evaluate(callback.parentEnv).call(args);

  return array.reduce(callCallback, initialValue);
}

function reduceRight(args: any[]): any {
  ensureArgsCount(
    args,
    2,
    "reduceRight requires at least 2 arguments: array and callback.",
  );
  const [array, callback, initialValue] = args;

  if (!isFunctionNode(callback)) {
    throw new FunctionCallError(
      "Invalid callback. Must be a FunctionDeclaration or FunctionExpression.",
      [`mylang:arrays (${__filename})`],
    );
  }

  const callCallback = (...args: any[]) =>
    callback.evaluate(callback.parentEnv).call(args);

  return array.reduceRight(callCallback, initialValue);
}

function reverse(args: any[]): any[] {
  ensureArgsCount(args, 1, "reverse requires 1 argument: array.");
  return args[0].reverse();
}

function shift(args: any[]): any {
  ensureArgsCount(args, 1, "shift requires 1 argument: array.");
  return args[0].shift();
}

function slice(args: any[]): any[] {
  ensureArgsCount(args, 1, "slice requires at least 1 argument: array.");
  const [array, start, end] = args;
  return array.slice(start, end);
}

function some(args: any[]): boolean {
  ensureArgsCount(args, 2, "some requires 2 arguments: array and callback.");
  const [array, callback] = args;

  if (!isFunctionNode(callback)) {
    throw new FunctionCallError(
      "Invalid callback. Must be a FunctionDeclaration or FunctionExpression.",
      [`mylang:arrays (${__filename})`],
    );
  }

  const callCallback = (...args: any[]) =>
    callback.evaluate(callback.parentEnv).call(args);

  return array.some(callCallback);
}

function sort(args: any[]): any[] {
  ensureArgsCount(args, 1, "sort requires at least 1 argument: array.");
  const [array, compareFn] = args;

  if (!compareFn) {
    return array.sort();
  }

  if (!isFunctionNode(compareFn)) {
    throw new FunctionCallError(
      "Invalid callback. Must be a FunctionDeclaration or FunctionExpression.",
      [`mylang:arrays (${__filename})`],
    );
  }

  const callCallback = (...args: any[]) =>
    compareFn.evaluate(compareFn.parentEnv).call(args);

  return array.sort(callCallback);
}

function splice(args: any[]): any[] {
  ensureArgsCount(args, 1, "splice requires at least 1 argument: array.");
  const [array, start, deleteCount, ...items] = args;
  return array.splice(start, deleteCount, ...items);
}

function unshift(args: any[]): number {
  ensureArgsCount(
    args,
    2,
    "unshift requires at least 2 arguments: array and values.",
  );
  return args[0].unshift(...args.slice(1));
}

function count(args: any[]): number {
  ensureArgsCount(args, 1, "unshift requires at least 1 arguments: array.");
  return args[0].length;
}

export {
  create,
  concat,
  copyWithin,
  every,
  fill,
  filter,
  find,
  findIndex,
  flat,
  flatMap,
  forEach,
  includes,
  indexOf,
  join,
  lastIndexOf,
  map,
  pop,
  push,
  reduce,
  reduceRight,
  reverse,
  shift,
  slice,
  some,
  sort,
  splice,
  unshift,
  count,
};
