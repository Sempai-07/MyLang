import { isFunctionNode } from "../../utils";
import { BaseError } from "../../../errors/BaseError";

function processArray(arr: any[]): any[] {
  arr.forEach((value, index) => {
    if (Array.isArray(value)) {
      arr[index] = processArray(value);
    } else if (value && typeof value === "object") {
      arr[index] = processObject(value);
    } else if (isFunctionNode(value)) {
      arr[index] = value?.name
        ? { [String(value.name)]() {} }[value.name]
        : { anonymous() {} }["anonymous"];
    } else if (value === null) {
      arr[index] = "nil";
    }
  });

  return arr;
}

function processObject(obj: Record<any, any>): any {
  if (isFunctionNode(obj)) {
    return obj?.name
      ? { [String(obj.name)]() {} }[obj.name]
      : { anonymous() {} }["anonymous"];
  }

  for (const [name, value] of Object.entries(obj)) {
    if (Array.isArray(value)) {
      obj[name] = processArray(value);
    } else if (value && typeof value === "object") {
      obj[name] = processObject(value);
    } else if (isFunctionNode(value)) {
      obj[name] = value?.name
        ? { [String(value.name)]() {} }[value.name]
        : { anonymous() {} }["anonymous"];
    } else if (value === null) {
      obj[name] = "nil";
    }
  }

  return obj;
}

function printf(args: any[]): any {
  const regex = /&\{(\d+)\}/g;
  const template = args[0] ?? "";

  if (args[0] instanceof BaseError) {
    console.error(args[0].toString());
    return;
  }

  if (typeof template !== "string") {
    const processedArgs = [...args].map((value) => {
      if (Array.isArray(value)) {
        return processArray([...value]);
      } else if (value && typeof value === "object") {
        return processObject({ ...value });
      } else if (isFunctionNode(value)) {
        return value?.name
          ? { [String(value.name)]() {} }[value.name]
          : { anonymous() {} }["anonymous"];
      } else if (value === null) {
        return "nil";
      }
      return value;
    });

    console.log(...processedArgs);
    return;
  }

  args.shift();

  const result = template.replace(regex, (_: string, index: string) => {
    const argIndex = parseInt(index, 10);
    return args[argIndex - 1] ?? "";
  });

  console.log(result);
}

function print(args: any[]): any {
  if (args[0] instanceof BaseError) {
    console.error(args[0].toString());
    return;
  }

  const processedArgs = [...args].map((value) => {
    if (Array.isArray(value)) {
      return processArray([...value]);
    } else if (value && typeof value === "object") {
      return processObject({ ...value });
    } else if (isFunctionNode(value)) {
      return value?.name
        ? { [String(value.name)]() {} }[value.name]
        : { anonymous() {} }["anonymous"];
    } else if (value === null) {
      return "nil";
    }
    return value;
  });

  console.log(...processedArgs);
  return;
}

export { printf, print };
