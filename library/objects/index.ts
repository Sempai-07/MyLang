import { FunctionBuilder, FunctionBuilderCodeError } from "../FunctionBuilder";
import { Environment } from "../../src/Environment";
import { type StmtType } from "../../src/ast/StmtType";
import { isTypeArgs } from "../utils/utils";

abstract class ObjectMethodBuilder extends FunctionBuilder {
  constructor(args: any[], astArgs: StmtType[], environment: Environment) {
    super(args, astArgs, environment);
  }

  get pkgInfo() {
    return {
      name: "objects",
      path: __dirname,
    };
  }

  protected validateObject(obj: any, argName: string = "object"): void {
    if (argName && isTypeArgs(obj) !== "object") {
      throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsTypeError, {
        propsName: argName,
        expectType: "object",
        received: isTypeArgs(obj),
      });
    } else if (isTypeArgs(obj) !== "object") {
      throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsFirstTypeError, {
        expectType: "object",
        received: isTypeArgs(obj),
      });
    }
  }

  protected validateFunction(func: any, argName: string = "callback"): void {
    if (isTypeArgs(func) !== "function") {
      throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsTypeError, {
        propsName: argName,
        expectType: "func",
        received: isTypeArgs(func),
      });
    }
  }

  protected validateString(str: any, argName: string = "string"): void {
    if (isTypeArgs(str) !== "string") {
      throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsTypeError, {
        propsName: argName,
        expectType: "string",
        received: isTypeArgs(str),
      });
    }
  }

  protected validateArray(arr: any, argName: string = "array"): void {
    if (isTypeArgs(arr) !== "array") {
      throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsTypeError, {
        propsName: argName,
        expectType: "array",
        received: isTypeArgs(arr),
      });
    }
  }

  protected async executeCallback(callbackFunc: any, args: any[]): Promise<any> {
    if (this.isBuildModuleFunction(callbackFunc)) {
      return new callbackFunc(args, [], this.environment).call();
    }
    return callbackFunc.call(args.map((v) => ({ value: v })));
  }

  call() {
    throw new Error("Call is not implemented");
  }
}

class Keys extends ObjectMethodBuilder {
  override call() {
    const [obj] = this.args;
    this.validateObject(obj);

    return Object.keys(obj);
  }
}

class Values extends ObjectMethodBuilder {
  override call() {
    const [obj] = this.args;
    this.validateObject(obj);

    return Object.values(obj);
  }
}

class Entries extends ObjectMethodBuilder {
  override call() {
    const [obj] = this.args;
    this.validateObject(obj);

    return Object.entries(obj);
  }
}

class FromEntries extends ObjectMethodBuilder {
  override call() {
    const [entries] = this.args;
    this.validateArray(entries, "entries");

    return Object.fromEntries(entries);
  }
}

class Assign extends ObjectMethodBuilder {
  override call() {
    const [target, ...sources] = this.args;
    this.validateObject(target, "target");

    return Object.assign(target, ...sources);
  }
}

class Create extends ObjectMethodBuilder {
  override call() {
    const [proto, propertiesObject] = this.args;

    return Object.create(proto, propertiesObject);
  }
}

class DefineProperty extends ObjectMethodBuilder {
  override call() {
    const [obj, prop, descriptor] = this.args;
    this.validateObject(obj);
    this.validateString(prop, "property");
    this.validateObject(descriptor, "descriptor");

    return Object.defineProperty(obj, prop, descriptor);
  }
}

class DefineProperties extends ObjectMethodBuilder {
  override call() {
    const [obj, properties] = this.args;
    this.validateObject(obj);
    this.validateObject(properties, "properties");

    return Object.defineProperties(obj, properties);
  }
}

class GetOwnPropertyDescriptor extends ObjectMethodBuilder {
  override call() {
    const [obj, prop] = this.args;
    this.validateObject(obj);
    this.validateString(prop, "property");

    return Object.getOwnPropertyDescriptor(obj, prop);
  }
}

class GetOwnPropertyDescriptors extends ObjectMethodBuilder {
  override call() {
    const [obj] = this.args;
    this.validateObject(obj);

    return Object.getOwnPropertyDescriptors(obj);
  }
}

class HasOwnProperty extends ObjectMethodBuilder {
  override call() {
    const [obj, prop] = this.args;
    this.validateObject(obj);
    this.validateString(prop, "property");

    return Object.prototype.hasOwnProperty.call(obj, prop);
  }
}

class PropertyIsEnumerable extends ObjectMethodBuilder {
  override call() {
    const [obj, prop] = this.args;
    this.validateObject(obj);
    this.validateString(prop, "property");

    return obj.propertyIsEnumerable(prop);
  }
}

class Is extends ObjectMethodBuilder {
  override call() {
    const [value1, value2] = this.args;

    return Object.is(value1, value2);
  }
}

class DeepClone extends ObjectMethodBuilder {
  override call() {
    const [obj] = this.args;
    this.validateObject(obj);

    return this.deepCloneRecursive(obj, new WeakMap());
  }

  private deepCloneRecursive(obj: any, visited: WeakMap<any, any>): any {
    if (obj === null || typeof obj !== "object") return obj;

    if (visited.has(obj)) return visited.get(obj);

    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof RegExp) return new RegExp(obj);
    if (obj instanceof Map) {
      const cloned = new Map();
      visited.set(obj, cloned);
      for (const [key, value] of obj) {
        cloned.set(key, this.deepCloneRecursive(value, visited));
      }
      return cloned;
    }
    if (obj instanceof Set) {
      const cloned = new Set();
      visited.set(obj, cloned);
      for (const value of obj) {
        cloned.add(this.deepCloneRecursive(value, visited));
      }
      return cloned;
    }
    if (Array.isArray(obj)) {
      const cloned: any[] = [];
      visited.set(obj, cloned);
      for (let i = 0; i < obj.length; i++) {
        cloned[i] = this.deepCloneRecursive(obj[i], visited);
      }
      return cloned;
    }

    const cloned = Object.create(Object.getPrototypeOf(obj));
    visited.set(obj, cloned);

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = this.deepCloneRecursive(obj[key], visited);
      }
    }

    return cloned;
  }
}

class ShallowClone extends ObjectMethodBuilder {
  override call() {
    const [obj] = this.args;
    this.validateObject(obj);

    return { ...obj };
  }
}

class Pick extends ObjectMethodBuilder {
  override call() {
    const [obj, ...keys] = this.args;
    this.validateObject(obj);

    const result: any = {};
    for (const key of keys) {
      if (key in obj) {
        result[key] = obj[key];
      }
    }
    return result;
  }
}

class Omit extends ObjectMethodBuilder {
  override call() {
    const [obj, ...keys] = this.args;
    this.validateObject(obj);

    const result: any = {};
    const keysToOmit = new Set(keys);

    for (const key in obj) {
      if (obj.hasOwnProperty(key) && !keysToOmit.has(key)) {
        result[key] = obj[key];
      }
    }
    return result;
  }
}

class Merge extends ObjectMethodBuilder {
  override call() {
    const [target, ...sources] = this.args;
    this.validateObject(target, "target");

    return this.mergeRecursive(target, ...sources);
  }

  private mergeRecursive(target: any, ...sources: any[]): any {
    if (!sources.length) return target;
    const source = sources.shift();

    if (this.isObject(target) && this.isObject(source)) {
      for (const key in source) {
        if (this.isObject(source[key])) {
          if (!target[key]) Object.assign(target, { [key]: {} });
          this.mergeRecursive(target[key], source[key]);
        } else {
          Object.assign(target, { [key]: source[key] });
        }
      }
    }

    return this.mergeRecursive(target, ...sources);
  }

  private isObject(item: any): boolean {
    return item && typeof item === "object" && !Array.isArray(item);
  }
}

class MapValues extends ObjectMethodBuilder {
  override async call() {
    const [obj, callbackFunc] = this.args;
    this.validateObject(obj);
    this.validateFunction(callbackFunc, "callbackFunc");

    const result: any = {};
    const keys = Object.keys(obj);

    for (const key of keys) {
      result[key] = await this.executeCallback(callbackFunc, [obj[key], key, obj]);
    }

    return result;
  }
}

class MapKeys extends ObjectMethodBuilder {
  override async call() {
    const [obj, callbackFunc] = this.args;
    this.validateObject(obj);
    this.validateFunction(callbackFunc, "callbackFunc");

    const result: any = {};
    const keys = Object.keys(obj);

    for (const key of keys) {
      const newKey = await this.executeCallback(callbackFunc, [key, obj[key], obj]);
      result[newKey] = obj[key];
    }

    return result;
  }
}

class Filter extends ObjectMethodBuilder {
  override async call() {
    const [obj, callbackFunc] = this.args;
    this.validateObject(obj);
    this.validateFunction(callbackFunc, "callbackFunc");

    const result: any = {};
    const keys = Object.keys(obj);

    for (const key of keys) {
      const shouldInclude = await this.executeCallback(callbackFunc, [obj[key], key, obj]);
      if (shouldInclude) {
        result[key] = obj[key];
      }
    }

    return result;
  }
}

class Reduce extends ObjectMethodBuilder {
  override async call() {
    const [obj, callbackFunc, initialValue] = this.args;
    this.validateObject(obj);
    this.validateFunction(callbackFunc, "callbackFunc");

    const keys = Object.keys(obj);
    const hasInitialValue = this.args.length > 2;

    if (keys.length === 0 && !hasInitialValue) {
      throw this.throwErrorFormatters(new Error("Reduce of empty object with no initial value"));
    }

    let accumulator = hasInitialValue ? initialValue : obj[keys[0]!];
    const startIndex = hasInitialValue ? 0 : 1;

    for (let i = startIndex; i < keys.length; i++) {
      const key = keys[i]!;
      accumulator = await this.executeCallback(callbackFunc, [accumulator, obj[key], key, obj]);
    }

    return accumulator;
  }
}

class Every extends ObjectMethodBuilder {
  override async call() {
    const [obj, callbackFunc] = this.args;
    this.validateObject(obj);
    this.validateFunction(callbackFunc, "callbackFunc");

    const keys = Object.keys(obj);

    for (const key of keys) {
      const result = await this.executeCallback(callbackFunc, [obj[key], key, obj]);
      if (!result) {
        return false;
      }
    }

    return true;
  }
}

class Some extends ObjectMethodBuilder {
  override async call() {
    const [obj, callbackFunc] = this.args;
    this.validateObject(obj);
    this.validateFunction(callbackFunc, "callbackFunc");

    const keys = Object.keys(obj);

    for (const key of keys) {
      const result = await this.executeCallback(callbackFunc, [obj[key], key, obj]);
      if (result) {
        return true;
      }
    }

    return false;
  }
}

class Find extends ObjectMethodBuilder {
  override async call() {
    const [obj, callbackFunc] = this.args;
    this.validateObject(obj);
    this.validateFunction(callbackFunc, "callbackFunc");

    const keys = Object.keys(obj);

    for (const key of keys) {
      const found = await this.executeCallback(callbackFunc, [obj[key], key, obj]);
      if (found) {
        return [key, obj[key]];
      }
    }

    return null;
  }
}

class FindKey extends ObjectMethodBuilder {
  override async call() {
    const [obj, callbackFunc] = this.args;
    this.validateObject(obj);
    this.validateFunction(callbackFunc, "callbackFunc");

    const keys = Object.keys(obj);

    for (const key of keys) {
      const found = await this.executeCallback(callbackFunc, [obj[key], key, obj]);
      if (found) {
        return key;
      }
    }

    return null;
  }
}

class Invert extends ObjectMethodBuilder {
  override call() {
    const [obj] = this.args;
    this.validateObject(obj);

    const result: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        result[obj[key]] = key;
      }
    }
    return result;
  }
}

class Transform extends ObjectMethodBuilder {
  override async call() {
    const [obj, callbackFunc] = this.args;
    this.validateObject(obj);
    this.validateFunction(callbackFunc, "callbackFunc");

    const result: any = {};
    const keys = Object.keys(obj);

    for (const key of keys) {
      const transformed = await this.executeCallback(callbackFunc, [obj[key], key, obj]);
      if (
        transformed &&
        typeof transformed === "object" &&
        "key" in transformed &&
        "value" in transformed
      ) {
        result[transformed.key] = transformed.value;
      }
    }

    return result;
  }
}

class GroupBy extends ObjectMethodBuilder {
  override async call() {
    const [obj, callbackFunc] = this.args;
    this.validateObject(obj);
    this.validateFunction(callbackFunc, "callbackFunc");

    const result: any = {};
    const keys = Object.keys(obj);

    for (const key of keys) {
      const groupKey = await this.executeCallback(callbackFunc, [obj[key], key, obj]);
      if (!result[groupKey]) {
        result[groupKey] = {};
      }
      result[groupKey][key] = obj[key];
    }

    return result;
  }
}

class Compact extends ObjectMethodBuilder {
  override call() {
    const [obj] = this.args;
    this.validateObject(obj);

    const result: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key) && obj[key] != null) {
        result[key] = obj[key];
      }
    }
    return result;
  }
}

class Defaults extends ObjectMethodBuilder {
  override call() {
    const [obj, ...defaultObjs] = this.args;
    this.validateObject(obj);

    const result = { ...obj };

    for (const defaultObj of defaultObjs) {
      if (typeof defaultObj === "object" && defaultObj !== null) {
        for (const key in defaultObj) {
          if (defaultObj.hasOwnProperty(key) && result[key] === undefined) {
            result[key] = defaultObj[key];
          }
        }
      }
    }

    return result;
  }
}

module.exports = {
  keys: Keys,
  values: Values,
  entries: Entries,
  fromEntries: FromEntries,
  assign: Assign,
  create: Create,
  defineProperty: DefineProperty,
  defineProperties: DefineProperties,
  getOwnPropertyDescriptor: GetOwnPropertyDescriptor,
  getOwnPropertyDescriptors: GetOwnPropertyDescriptors,
  hasOwnProperty: HasOwnProperty,
  propertyIsEnumerable: PropertyIsEnumerable,
  is: Is,
  deepClone: DeepClone,
  shallowClone: ShallowClone,
  pick: Pick,
  omit: Omit,
  merge: Merge,
  mapValues: MapValues,
  mapKeys: MapKeys,
  filter: Filter,
  reduce: Reduce,
  every: Every,
  some: Some,
  find: Find,
  findKey: FindKey,
  invert: Invert,
  transform: Transform,
  groupBy: GroupBy,
  compact: Compact,
  defaults: Defaults,
};
