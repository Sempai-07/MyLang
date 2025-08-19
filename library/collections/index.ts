import { FunctionBuilder, FunctionBuilderCodeError } from "../FunctionBuilder";
import { Environment } from "../../src/Environment";
import { type StmtType } from "../../src/ast/StmtType";
import { isTypeArgs } from "../utils/utils";

abstract class CollectionsMethodBuilder extends FunctionBuilder {
  constructor(args: any[], astArgs: StmtType[], environment: Environment) {
    super(args, astArgs, environment);
  }

  get pkgInfo() {
    return {
      name: "collections",
      path: __dirname,
    };
  }

  protected validateSet(set: any, argName?: string): void {
    if (argName && !(set instanceof Set)) {
      throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsTypeError, {
        propsName: argName,
        expectType: "set",
        received: isTypeArgs(set),
      });
    } else if (!(set instanceof Set)) {
      throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsFirstTypeError, {
        expectType: "set",
        received: isTypeArgs(set),
      });
    }
  }

  protected validateMap(map: any, argName?: string): void {
    if (argName && !(map instanceof Map)) {
      throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsTypeError, {
        propsName: argName,
        expectType: "map",
        received: isTypeArgs(map),
      });
    } else if (!(map instanceof Map)) {
      throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsFirstTypeError, {
        expectType: "map",
        received: isTypeArgs(map),
      });
    }
  }

  protected validateFunction(func: any, argName: string = "callback"): void {
    if (isTypeArgs(func) !== "function") {
      throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsTypeError, {
        propsName: argName,
        expectType: "function",
        received: isTypeArgs(func),
      });
    }
  }

  protected executeCallback(callbackFunc: any, args: any[]): any {
    if (this.isBuildModuleFunction(callbackFunc)) {
      return new callbackFunc(args, [], this.environment).call();
    }
    return callbackFunc.call(args.map((v) => ({ value: v })));
  }

  call() {
    throw new Error("Call is not implemented");
  }
}

class Set extends CollectionsMethodBuilder {
  override call() {
    const [iterable] = this.args;
    const set = new globalThis.Set(iterable);

    return {
      add: class extends CollectionsMethodBuilder {
        override call() {
          const [value] = this.args;
          set.add(value);
          return new Set([set], [], this.environment);
        }
      },

      has: class extends CollectionsMethodBuilder {
        override call() {
          const [value] = this.args;
          return set.has(value);
        }
      },

      delete: class extends CollectionsMethodBuilder {
        override call() {
          const [value] = this.args;
          return set.delete(value);
        }
      },

      clear: class extends CollectionsMethodBuilder {
        override call() {
          set.clear();
          return null;
        }
      },

      size: class extends CollectionsMethodBuilder {
        override call() {
          return set.size;
        }
      },

      values: class extends CollectionsMethodBuilder {
        override call() {
          return Array.from(set.values());
        }
      },

      forEach: class extends CollectionsMethodBuilder {
        override async call() {
          const [callback] = this.args;
          this.validateFunction(callback);

          for (const value of set) {
            await this.executeCallback(callback, [value, value, set]);
          }
          return null;
        }
      },

      union: class extends CollectionsMethodBuilder {
        override call() {
          const [other] = this.args;
          this.validateSet(other);

          const result = new globalThis.Set(set);
          for (const item of other) {
            result.add(item);
          }
          return new Set([result], [], this.environment).call();
        }
      },

      intersection: class extends CollectionsMethodBuilder {
        override call() {
          const [other] = this.args;
          this.validateSet(other);

          const result = new globalThis.Set();
          for (const item of set) {
            if (other.has(item)) {
              result.add(item);
            }
          }
          return new Set([result], [], this.environment).call();
        }
      },

      difference: class extends CollectionsMethodBuilder {
        override call() {
          const [other] = this.args;
          this.validateSet(other);

          const result = new globalThis.Set();
          for (const item of set) {
            if (!other.has(item)) {
              result.add(item);
            }
          }
          return result;
        }
      },

      symmetricDifference: class extends CollectionsMethodBuilder {
        override call() {
          const [other] = this.args;
          this.validateSet(other);

          const result = new globalThis.Set();
          for (const item of set) {
            if (!other.has(item)) {
              result.add(item);
            }
          }
          for (const item of other) {
            if (!set.has(item)) {
              result.add(item);
            }
          }
          return new Set([result], [], this.environment).call();
        }
      },

      isSubset: class extends CollectionsMethodBuilder {
        override call() {
          const [other] = this.args;
          this.validateSet(other);

          for (const item of set) {
            if (!other.has(item)) {
              return false;
            }
          }
          return true;
        }
      },

      isSuperset: class extends CollectionsMethodBuilder {
        override call() {
          const [other] = this.args;
          this.validateSet(other);

          for (const item of other) {
            if (!set.has(item)) {
              return false;
            }
          }
          return true;
        }
      },

      isDisjoint: class extends CollectionsMethodBuilder {
        override call() {
          const [other] = this.args;
          this.validateSet(other);

          for (const item of set) {
            if (other.has(item)) {
              return false;
            }
          }
          return true;
        }
      },

      copy: class extends CollectionsMethodBuilder {
        override call() {
          return new Set([new globalThis.Set(set)], [], this.environment).call();
        }
      },

      *[Symbol.iterator]() {
        for (const value of set.values()) {
          yield value;
        }
      },

      [Environment.SymbolFormatedText]: `Set(${set.size}) { ${JSON.stringify([...set], null, set.size > 8 ? 2 : 0)} }`,
    };
  }
}

class Map extends CollectionsMethodBuilder {
  override call() {
    const [iterable] = this.args;
    const map = new globalThis.Map(iterable);

    return {
      set: class extends CollectionsMethodBuilder {
        override call() {
          const [key, value] = this.args;
          map.set(key, value);
          return new Map([map], [], this.environment).call();
        }
      },

      get: class extends CollectionsMethodBuilder {
        override call() {
          const [key] = this.args;
          return map.get(key);
        }
      },

      has: class extends CollectionsMethodBuilder {
        override call() {
          const [key] = this.args;
          return map.has(key);
        }
      },

      delete: class extends CollectionsMethodBuilder {
        override call() {
          const [key] = this.args;
          return map.delete(key);
        }
      },

      clear: class extends CollectionsMethodBuilder {
        override call() {
          map.clear();
          return null;
        }
      },

      size: class extends CollectionsMethodBuilder {
        override call() {
          return map.size;
        }
      },

      keys: class extends CollectionsMethodBuilder {
        override call() {
          return Array.from(map.keys());
        }
      },

      values: class extends CollectionsMethodBuilder {
        override call() {
          return Array.from(map.values());
        }
      },

      entries: class extends CollectionsMethodBuilder {
        override call() {
          return Array.from(map.entries());
        }
      },

      forEach: class extends CollectionsMethodBuilder {
        override async call() {
          const [callback] = this.args;
          this.validateFunction(callback);

          for (const [key, value] of map) {
            await this.executeCallback(callback, [value, key, map]);
          }
          return null;
        }
      },

      copy: class extends CollectionsMethodBuilder {
        override call() {
          return new Map([new globalThis.Map(map)], [], this.environment).call();
        }
      },

      merge: class extends CollectionsMethodBuilder {
        override call() {
          const [other] = this.args;
          this.validateMap(other);

          const result = new globalThis.Map(map);
          for (const [key, value] of other) {
            result.set(key, value);
          }
          return new Map([result], [], this.environment).call();
        }
      },

      *[Symbol.iterator]() {
        for (const [key, value] of map.entries()) {
          yield [key, value];
        }
      },

      [Environment.SymbolFormatedText]: `Map(${map.size}) { ${JSON.stringify([...map], null, map.size > 8 ? 2 : 0)} }`,
    };
  }
}

class Counter extends CollectionsMethodBuilder {
  override call() {
    const [iterable] = this.args;
    const counter = new globalThis.Map();

    if (iterable) {
      for (const item of iterable) {
        counter.set(item, (counter.get(item) || 0) + 1);
      }
    }

    return {
      update: class extends CollectionsMethodBuilder {
        override call() {
          const [items] = this.args;

          if (items) {
            for (const item of items) {
              counter.set(item, (counter.get(item) || 0) + 1);
            }
          }
          return null;
        }
      },

      mostCommon: class extends CollectionsMethodBuilder {
        override call() {
          const [n] = this.args;

          const entries = Array.from(counter.entries());
          entries.sort((a, b) => b[1] - a[1]);

          return n ? entries.slice(0, n) : entries;
        }
      },

      subtract: class extends CollectionsMethodBuilder {
        override call() {
          const [items] = this.args;

          if (items) {
            for (const item of items) {
              const current = counter.get(item) || 0;
              if (current > 0) {
                counter.set(item, current - 1);
                if (counter.get(item) === 0) {
                  counter.delete(item);
                }
              }
            }
          }
          return null;
        }
      },

      elements: class extends CollectionsMethodBuilder {
        override call() {
          const result = [];
          for (const [item, count] of counter) {
            for (let i = 0; i < count; i++) {
              result.push(item);
            }
          }
          return result;
        }
      },

      total: class extends CollectionsMethodBuilder {
        override call() {
          let sum = 0;
          for (const count of counter.values()) {
            sum += count;
          }
          return sum;
        }
      },

      get: class extends CollectionsMethodBuilder {
        override call() {
          const [key] = this.args;
          return counter.get(key) || 0;
        }
      },

      set: class extends CollectionsMethodBuilder {
        override call() {
          const [key, value] = this.args;
          counter.set(key, value);
          return new Counter([counter], [], this.environment).call();
        }
      },

      keys: class extends CollectionsMethodBuilder {
        override call() {
          return Array.from(counter.keys());
        }
      },

      values: class extends CollectionsMethodBuilder {
        override call() {
          return Array.from(counter.values());
        }
      },

      *[Symbol.iterator]() {
        for (const [key, value] of counter.entries()) {
          yield [key, value];
        }
      },

      [Environment.SymbolFormatedText]: `Counter { ${counter.size} }`,
    };
  }
}

class DefaultDict extends CollectionsMethodBuilder {
  override call() {
    const [defaultFactory] = this.args;
    const dict = new globalThis.Map();

    return {
      get: class extends CollectionsMethodBuilder {
        override call() {
          const [key] = this.args;

          if (!dict.has(key)) {
            if (defaultFactory) {
              const defaultValue = this.executeCallback(defaultFactory, []);
              dict.set(key, defaultValue);
              return defaultValue;
            }
            return null;
          }
          return dict.get(key);
        }
      },

      set: class extends CollectionsMethodBuilder {
        override call() {
          const [key, value] = this.args;
          dict.set(key, value);
          return new Map([dict], [], this.environment).call();
        }
      },

      has: class extends CollectionsMethodBuilder {
        override call() {
          const [key] = this.args;
          return dict.has(key);
        }
      },

      delete: class extends CollectionsMethodBuilder {
        override call() {
          const [key] = this.args;
          return dict.delete(key);
        }
      },

      keys: class extends CollectionsMethodBuilder {
        override call() {
          return Array.from(dict.keys());
        }
      },

      values: class extends CollectionsMethodBuilder {
        override call() {
          return Array.from(dict.values());
        }
      },

      entries: class extends CollectionsMethodBuilder {
        override call() {
          return Array.from(dict.entries());
        }
      },

      *[Symbol.iterator]() {
        for (const [key, value] of dict.entries()) {
          yield [key, value];
        }
      },

      [Environment.SymbolFormatedText]: `DefaultDict { ${dict.size} }`,
    };
  }
}

class OrderedDict extends CollectionsMethodBuilder {
  override call() {
    const [iterable] = this.args;
    const dict = new globalThis.Map(iterable);

    return {
      set: class extends CollectionsMethodBuilder {
        override call() {
          const [key, value] = this.args;
          dict.set(key, value);
          return new OrderedDict([dict], [], this.environment).call();
        }
      },

      get: class extends CollectionsMethodBuilder {
        override call() {
          const [key] = this.args;
          return dict.get(key);
        }
      },

      popitem: class extends CollectionsMethodBuilder {
        override call() {
          const [last = true] = this.args;

          if (dict.size === 0) {
            throw this.throwErrorFormatters(new Error("popitem(): dictionary is empty"));
          }

          const entries = Array.from(dict.entries());
          const item = last ? entries[entries.length - 1] : entries[0];
          dict.delete(item![0]);

          return item;
        }
      },

      moveToEnd: class extends CollectionsMethodBuilder {
        override call() {
          const [key, last = true] = this.args;

          if (!dict.has(key)) {
            throw this.throwErrorFormatters(new Error(`Key '${key}' not found`));
          }

          const value = dict.get(key);
          dict.delete(key);

          if (last) {
            dict.set(key, value);
          } else {
            const entries = Array.from(dict.entries());
            dict.clear();
            dict.set(key, value);
            for (const [k, v] of entries) {
              dict.set(k, v);
            }
          }
          return null;
        }
      },

      keys: class extends CollectionsMethodBuilder {
        override call() {
          return Array.from(dict.keys());
        }
      },

      values: class extends CollectionsMethodBuilder {
        override call() {
          return Array.from(dict.values());
        }
      },

      entries: class extends CollectionsMethodBuilder {
        override call() {
          return Array.from(dict.entries());
        }
      },

      *[Symbol.iterator]() {
        for (const [key, value] of dict.entries()) {
          yield [key, value];
        }
      },

      [Environment.SymbolFormatedText]: `OrderedDict { ${dict.size} }`,
    };
  }
}

module.exports = {
  Set,
  Map,
  Counter,
  DefaultDict,
  OrderedDict,
};
