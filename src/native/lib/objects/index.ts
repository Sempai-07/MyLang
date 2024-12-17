function ensureArgsCount(args: any[], count: number, message: string): void {
  if (args.length < count) throw message;
}

function assign(args: any[]): Record<any, any> {
  ensureArgsCount(
    args,
    2,
    "assign requires at least 2 arguments: target and sources.",
  );
  return Object.assign(args[0], ...args.slice(1));
}

function create(args: any[]): Record<any, any> {
  ensureArgsCount(args, 1, "create requires at least 1 argument: prototype.");
  const [proto, properties] = args;
  if (typeof proto !== "object" && proto !== null) {
    throw "First argument to create must be an object or null.";
  }
  return Object.create(proto, properties);
}

function defineProperty(args: any[]): void {
  ensureArgsCount(
    args,
    3,
    "defineProperty requires 3 arguments: object, property, and descriptor.",
  );
  const [obj, property, descriptor] = args;
  Object.defineProperty(obj, property, descriptor);
}

function defineProperties(args: any[]): void {
  ensureArgsCount(
    args,
    2,
    "defineProperties requires 2 arguments: object and descriptors.",
  );
  const [obj, descriptors] = args;
  Object.defineProperties(obj, descriptors);
}

function entries(args: any[]): [string, any][] {
  ensureArgsCount(args, 1, "entries requires 1 argument: object.");
  return Object.entries(args[0]);
}

function freeze(args: any[]): Record<any, any> {
  ensureArgsCount(args, 1, "freeze requires 1 argument: object.");
  return Object.freeze(args[0]);
}

function fromEntries(args: any[]): Record<any, any> {
  ensureArgsCount(args, 1, "fromEntries requires 1 argument: iterable.");
  return Object.fromEntries(args[0]);
}

function getOwnPropertyNames(args: any[]): string[] {
  ensureArgsCount(args, 1, "getOwnPropertyNames requires 1 argument: object.");
  return Object.getOwnPropertyNames(args[0]);
}

function getPrototypeOf(args: any[]): object | null {
  ensureArgsCount(args, 1, "getPrototypeOf requires 1 argument: object.");
  return Object.getPrototypeOf(args[0]);
}

function is(args: any[]): boolean {
  ensureArgsCount(args, 2, "is requires 2 arguments: value1 and value2.");
  return Object.is(args[0], args[1]);
}

function isExtensible(args: any[]): boolean {
  ensureArgsCount(args, 1, "isExtensible requires 1 argument: object.");
  return Object.isExtensible(args[0]);
}

function isFrozen(args: any[]): boolean {
  ensureArgsCount(args, 1, "isFrozen requires 1 argument: object.");
  return Object.isFrozen(args[0]);
}

function isSealed(args: any[]): boolean {
  ensureArgsCount(args, 1, "isSealed requires 1 argument: object.");
  return Object.isSealed(args[0]);
}

function keys(args: any[]): string[] {
  ensureArgsCount(args, 1, "keys requires 1 argument: object.");
  return Object.keys(args[0]);
}

function preventExtensions(args: any[]): Record<any, any> {
  ensureArgsCount(args, 1, "preventExtensions requires 1 argument: object.");
  return Object.preventExtensions(args[0]);
}

function seal(args: any[]): Record<any, any> {
  ensureArgsCount(args, 1, "seal requires 1 argument: object.");
  return Object.seal(args[0]);
}

function setPrototypeOf(args: any[]): Record<any, any> {
  ensureArgsCount(
    args,
    2,
    "setPrototypeOf requires 2 arguments: object and prototype.",
  );
  return Object.setPrototypeOf(args[0], args[1]);
}

function values(args: any[]): any[] {
  ensureArgsCount(args, 1, "values requires 1 argument: object.");
  return Object.values(args[0]);
}

export {
  assign,
  create,
  defineProperty,
  defineProperties,
  entries,
  freeze,
  fromEntries,
  getOwnPropertyNames,
  getPrototypeOf,
  is,
  isExtensible,
  isFrozen,
  isSealed,
  keys,
  preventExtensions,
  seal,
  setPrototypeOf,
  values,
};
