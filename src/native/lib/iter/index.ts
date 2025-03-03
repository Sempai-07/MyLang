import { typeOf } from "../utils/index";
import { BaseError } from "../../../errors/BaseError";

function Iterator([collection]: [Record<string, any> | any[]]) {
  if (typeOf([collection]) === "array") {
    let index = 0;
    return {
      next: function () {
        if (index < collection.length) {
          return { value: (collection as any[])[index++], done: false };
        }
        return { value: null, done: true };
      },
      *[Symbol.iterator]() {
        for (const value of <any[]>collection) {
          yield value;
        }
      },
    };
  }
  if (typeOf([collection]) === "object") {
    let index = 0;
    const keys = <string[]>Object.keys(collection);

    return {
      next: function () {
        if (index < keys.length) {
          let key = keys[index++];
          return {
            value: { key, value: (collection as Record<string, any>)[key!] },
            done: false,
          };
        }
        return { value: null, done: true };
      },
      *[Symbol.iterator]() {
        for (const key of keys) {
          yield { key, value: (collection as Record<string, any>)[key] };
        }
      },
    };
  }

  throw new BaseError("Unsupported type for iteration", {
    files: [`mylang:iter (${__filename})`],
  });
}

const symbol = Symbol("CustomIterator");

export { Iterator, symbol };
