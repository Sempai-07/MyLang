import { ArgumentsError } from "../../../errors/BaseError";

function ensureArgsCount(args: any[], count: number, message: string): void {
  if (args.length < count) {
    throw new ArgumentsError(message, [`mylang:objects (${__filename})`]);
  }
}

function assign(args: any[]): Record<any, any> {
  ensureArgsCount(
    args,
    2,
    "requires at least 2 arguments: target and sources.",
  );
  return Object.assign(args[0], ...args.slice(1));
}

function create(args: any[]): Record<any, any> {
  ensureArgsCount(args, 1, "requires at least 1 argument: prototype.");
  const [proto, properties] = args;
  if (typeof proto !== "object" && proto !== null) {
    throw new ArgumentsError(
      "First argument to create must be an object or nil.",
      [`mylang:objects (${__filename})`],
    );
  }
  return Object.create(proto, properties);
}

function defineProperty(args: any[]): void {
  ensureArgsCount(
    args,
    3,
    "requires 3 arguments: object, property, and descriptor.",
  );
  const [obj, property, descriptor] = args;
  Object.defineProperty(obj, property, descriptor);
}

function defineProperties(args: any[]): void {
  ensureArgsCount(args, 2, "requires 2 arguments: object and descriptors.");
  const [obj, descriptors] = args;
  Object.defineProperties(obj, descriptors);
}

function entries(args: any[]): [string, any][] {
  ensureArgsCount(args, 1, "requires 1 argument: object.");
  return Object.entries(args[0]);
}

function freeze(args: any[]): Record<any, any> {
  ensureArgsCount(args, 1, "requires 1 argument: object.");
  return Object.freeze(args[0]);
}

function fromEntries(args: any[]): Record<any, any> {
  ensureArgsCount(args, 1, "requires 1 argument: iterable.");
  return Object.fromEntries(args[0]);
}

function getOwnPropertyNames(args: any[]): string[] {
  ensureArgsCount(args, 1, "requires 1 argument: object.");
  return Object.getOwnPropertyNames(args[0]);
}

function getPrototypeOf(args: any[]): object | null {
  ensureArgsCount(args, 1, "requires 1 argument: object.");
  return Object.getPrototypeOf(args[0]);
}

function is(args: any[]): boolean {
  ensureArgsCount(args, 2, "requires 2 arguments: value1 and value2.");
  return Object.is(args[0], args[1]);
}

function isExtensible(args: any[]): boolean {
  ensureArgsCount(args, 1, "requires 1 argument: object.");
  return Object.isExtensible(args[0]);
}

function isFrozen(args: any[]): boolean {
  ensureArgsCount(args, 1, "requires 1 argument: object.");
  return Object.isFrozen(args[0]);
}

function isSealed(args: any[]): boolean {
  ensureArgsCount(args, 1, "requires 1 argument: object.");
  return Object.isSealed(args[0]);
}

function keys(args: any[]): string[] {
  ensureArgsCount(args, 1, "requires 1 argument: object.");
  return Object.keys(args[0]);
}

function preventExtensions(args: any[]): Record<any, any> {
  ensureArgsCount(args, 1, "requires 1 argument: object.");
  return Object.preventExtensions(args[0]);
}

function seal(args: any[]): Record<any, any> {
  ensureArgsCount(args, 1, "requires 1 argument: object.");
  return Object.seal(args[0]);
}

function setPrototypeOf(args: any[]): Record<any, any> {
  ensureArgsCount(args, 2, "requires 2 arguments: object and prototype.");
  return Object.setPrototypeOf(args[0], args[1]);
}

function values(args: any[]): any[] {
  ensureArgsCount(args, 1, "requires 1 argument: object.");
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
