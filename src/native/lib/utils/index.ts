import { isFunctionNode } from "../../utils";

function typeOf([args]: [any]) {
  if (args === undefined || args === null) {
    return "nil";
  }

  const type = typeof args;

  if (type === "number") {
    if (isNaN(args)) {
      return "nan";
    }
    if (!isFinite(args)) {
      return "infinity";
    }
    return Number.isInteger(args) ? "int" : "float";
  }

  if (type === "object") {
    if (Array.isArray(args)) {
      return "array";
    }
    if (isFunctionNode(args)) {
      return "function";
    }
    return "object";
  }

  if (type === "boolean") {
    return "boolean";
  }

  return "string";
}

function isEmpty([args]: [any]) {
  const type = typeOf([args]);

  if (type === "nil") {
    return true;
  } else if (type === "string") {
    return args.trim().length === 0;
  } else if (type === "object") {
    return Object.keys(args).length === 0;
  } else if (type === "array") {
    return args.length === 0;
  } else if (type === "function") {
    return args.body?.body.length === 0;
  }

  return false;
}

export { typeOf, isEmpty };
