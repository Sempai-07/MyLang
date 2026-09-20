import { FunctionBuilder, FunctionBuilderCodeError } from "../FunctionBuilder";
import { Environment } from "../../src/Environment";
import { type StmtType } from "../../src/ast/StmtType";
import { isTypeArgs } from "../utils/utils";

abstract class IterMethodBuilder extends FunctionBuilder {
  constructor(args: any[], astArgs: StmtType[], environment: Environment) {
    super(args, astArgs, environment);
  }

  get pkgInfo() {
    return {
      name: "iter",
      path: __dirname,
    };
  }

  protected validateIterable(iterable: any, argName: string = "iterable"): void {
    const type = isTypeArgs(iterable);
    if (type !== "array" && type !== "object" && type !== "string") {
      throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsTypeError, {
        propsName: argName,
        expectType: "iterable (array, object, or string)",
        received: type,
      });
    }
  }

  protected validateNumber(num: any, argName: string = "number"): void {
    if (isTypeArgs(num) !== "int" && isTypeArgs(num) !== "float") {
      throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsTypeError, {
        propsName: argName,
        expectType: "number",
        received: isTypeArgs(num),
      });
    }
  }

  protected validateFunction(func: any, argName: string = "function"): void {
    if (isTypeArgs(func) !== "function") {
      throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsTypeError, {
        propsName: argName,
        expectType: "function",
        received: isTypeArgs(func),
      });
    }
  }

  protected validateBoolean(bool: any, argName: string = "boolean"): void {
    if (isTypeArgs(bool) !== "boolean") {
      throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsTypeError, {
        propsName: argName,
        expectType: "boolean",
        received: isTypeArgs(bool),
      });
    }
  }

  public async executeCallback(callbackFunc: any, args: any[]): Promise<any> {
    if (this.isBuildModuleFunction(callbackFunc)) {
      return new callbackFunc(args, [], this.environment).call();
    }
    return callbackFunc.call(args.map((v) => ({ value: v })));
  }

  call() {
    throw new Error("Call is not implemented");
  }
}

class Iterator extends IterMethodBuilder {
  override call() {
    const [collection] = this.args;

    if (isTypeArgs(collection) === "array") {
      let index = 0;

      class NextMethod extends IterMethodBuilder {
        override call() {
          if (index < collection.length) {
            return { value: collection[index++], done: false };
          }
          return { value: null, done: true };
        }
      }

      return {
        next: NextMethod,
        *[Symbol.iterator]() {
          for (const value of collection) {
            yield value;
          }
        },
      };
    }

    if (isTypeArgs(collection) === "object") {
      let index = 0;
      const keys = Object.keys(collection);

      class NextMethod extends IterMethodBuilder {
        override call() {
          if (index < keys.length) {
            const key = keys[index++];
            return {
              value: { key, value: collection[key!] },
              done: false,
            };
          }
          return { value: null, done: true };
        }
      }

      return {
        next: NextMethod,
        *[Symbol.iterator]() {
          for (const key of keys) {
            yield { key, value: collection[key] };
          }
        },
      };
    }

    throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsTypeError, {
      propsName: "collection",
      expectType: "iterable",
      received: isTypeArgs(collection),
    });
  }
}

class Range extends IterMethodBuilder {
  override call() {
    const [start, stop, step] = this.args;

    let actualStart: number, actualStop: number, actualStep: number;

    if (stop === undefined) {
      actualStart = 0;
      actualStop = start;
      actualStep = 1;
    } else {
      actualStart = start;
      actualStop = stop;
      actualStep = step !== undefined ? step : 1;
    }

    this.validateNumber(actualStart, "start");
    this.validateNumber(actualStop, "stop");
    this.validateNumber(actualStep, "step");

    if (actualStep === 0) {
      throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsTypeError, {
        propsName: "step",
        expectType: "non-zero number",
        received: "zero",
      });
    }

    let current = actualStart;

    class NextMethod extends IterMethodBuilder {
      override call() {
        if ((actualStep > 0 && current < actualStop) || (actualStep < 0 && current > actualStop)) {
          const value = current;
          current += actualStep;
          return { value, done: false };
        }
        return { value: null, done: true };
      }
    }

    return {
      next: NextMethod,
      *[Symbol.iterator]() {
        let i = actualStart;
        while ((actualStep > 0 && i < actualStop) || (actualStep < 0 && i > actualStop)) {
          yield i;
          i += actualStep;
        }
      },
    };
  }
}

class Enumerate extends IterMethodBuilder {
  override call() {
    const [iterable, start = 0] = this.args;
    this.validateIterable(iterable, "iterable");

    if (start !== undefined) {
      this.validateNumber(start, "start");
    }

    const iterator = new Iterator([iterable], [], this.environment).call();
    let index = start;

    class NextMethod extends IterMethodBuilder {
      override call() {
        const current = new iterator.next([], [], this.environment).call();
        if (!current.done) {
          return {
            value: { index: index++, value: current.value },
            done: false,
          };
        }
        return { value: null, done: true };
      }
    }

    return {
      next: NextMethod,
      *[Symbol.iterator]() {
        let i = start;
        for (const value of iterator) {
          yield { index: i++, value };
        }
      },
    };
  }
}

class Zip extends IterMethodBuilder {
  override call() {
    if (this.args.length === 0) {
      throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsTypeError, {
        propsName: "arguments",
        expectType: "at least 1",
        received: "0",
      });
    }

    const iterators = this.args.map((iterable, index) => {
      this.validateIterable(iterable, `iterable${index}`);
      return new Iterator([iterable], [], this.environment).call();
    });

    class NextMethod extends IterMethodBuilder {
      override call() {
        const values: any[] = [];
        let allDone = false;

        for (const iterator of iterators) {
          const current = new iterator.next([], [], this.environment).call();

          if (current.done) {
            allDone = true;
            break;
          }

          values.push(current.value);
        }

        if (allDone) {
          return { value: null, done: true };
        }

        return { value: values, done: false };
      }
    }

    const self = this;

    return {
      next: NextMethod,
      *[Symbol.iterator]() {
        while (true) {
          const values: any[] = [];
          let allDone = false;

          for (const iterator of iterators) {
            const current = new iterator.next([], [], self.environment).call();

            if (current.done) {
              allDone = true;
              break;
            }
            values.push(current.value);
          }

          if (allDone) break;
          yield values;
        }
      },
    };
  }
}

class ZipLongest extends IterMethodBuilder {
  override call() {
    if (this.args.length === 0) {
      throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsTypeError, {
        propsName: "arguments",
        expectType: "at least 1",
        received: "0",
      });
    }

    const fillValue = this.args[this.args.length - 1];
    const iterables = this.args.slice(0, -1);

    const iterators = iterables.map((iterable, index) => {
      this.validateIterable(iterable, `iterable${index}`);
      return new Iterator([iterable], [], this.environment).call();
    });

    class NextMethod extends IterMethodBuilder {
      override call() {
        const values: any[] = [];
        let allDone = true;

        for (const iterator of iterators) {
          const current = new iterator.next([], [], this.environment).call();

          if (!current.done) {
            values.push(current.value);
            allDone = false;
          } else {
            values.push(fillValue);
          }
        }

        if (allDone) {
          return { value: null, done: true };
        }

        return { value: values, done: false };
      }
    }

    const self = this;

    return {
      next: NextMethod,
      *[Symbol.iterator]() {
        while (true) {
          const values: any[] = [];
          let allDone = true;

          for (const iterator of iterators) {
            const current = new iterator.next([], [], self.environment).call();

            if (!current.done) {
              values.push(current.value);
              allDone = false;
            } else {
              values.push(fillValue);
            }
          }

          if (allDone) break;
          yield values;
        }
      },
    };
  }
}

class Chain extends IterMethodBuilder {
  override call() {
    if (this.args.length === 0) {
      throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsTypeError, {
        propsName: "arguments",
        expectType: "at least 1",
        received: "0",
      });
    }

    const iterators = this.args.map((iterable, index) => {
      this.validateIterable(iterable, `iterable${index}`);
      return new Iterator([iterable], [], this.environment).call();
    });

    let currentIteratorIndex = 0;

    class NextMethod extends IterMethodBuilder {
      override call() {
        while (currentIteratorIndex < iterators.length) {
          const currentIterator = iterators[currentIteratorIndex];
          if (currentIterator) {
            const current = new currentIterator.next([], [], this.environment).call();
            if (!current.done) {
              return current;
            }
          }
          currentIteratorIndex++;
        }
        return { value: null, done: true };
      }
    }

    return {
      next: NextMethod,
      *[Symbol.iterator]() {
        for (const iterator of iterators) {
          for (const value of iterator) {
            yield value;
          }
        }
      },
    };
  }
}

class Count extends IterMethodBuilder {
  override call() {
    const [start = 0, step = 1] = this.args;

    if (start !== undefined) this.validateNumber(start, "start");
    if (step !== undefined) this.validateNumber(step, "step");

    let current = start;

    class NextMethod extends IterMethodBuilder {
      override call() {
        const value = current;
        current += step;
        return { value, done: false };
      }
    }

    return {
      next: NextMethod,
      *[Symbol.iterator]() {
        let i = start;
        while (true) {
          yield i;
          i += step;
        }
      },
    };
  }
}

class Cycle extends IterMethodBuilder {
  override call() {
    const [iterable] = this.args;
    this.validateIterable(iterable, "iterable");

    const saved: any[] = [];
    const iterator = new Iterator([iterable], [], this.environment).call();
    let usesSaved = false;
    let savedIndex = 0;

    class NextMethod extends IterMethodBuilder {
      override call() {
        if (!usesSaved) {
          const current = new iterator.next([], [], this.environment).call();

          if (!current.done) {
            saved.push(current.value);
            return current;
          } else {
            if (saved.length === 0) {
              return { value: null, done: true };
            }
            usesSaved = true;
            savedIndex = 0;
          }
        }

        if (usesSaved) {
          const value = saved[savedIndex];
          savedIndex = (savedIndex + 1) % saved.length;
          return { value, done: false };
        }

        return { value: null, done: true };
      }
    }

    return {
      next: NextMethod,
      *[Symbol.iterator]() {
        const items: any[] = [];
        for (const value of iterator) {
          items.push(value);
          yield value;
        }

        if (items.length === 0) return;

        while (true) {
          for (const value of items) {
            yield value;
          }
        }
      },
    };
  }
}

class Repeat extends IterMethodBuilder {
  override call() {
    const [value, times] = this.args;

    let count = 0;
    const maxTimes = times !== undefined ? times : Infinity;

    if (times !== undefined) {
      this.validateNumber(times, "times");
      if (times < 0) {
        throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsTypeError, {
          propsName: "times",
          expectType: "non-negative number",
          received: "negative",
        });
      }
    }

    class NextMethod extends IterMethodBuilder {
      override call() {
        if (count < maxTimes) {
          count++;
          return { value, done: false };
        }
        return { value: null, done: true };
      }
    }

    return {
      next: NextMethod,
      *[Symbol.iterator]() {
        let i = 0;
        while (i < maxTimes) {
          yield value;
          i++;
        }
      },
    };
  }
}

class TakeWhile extends IterMethodBuilder {
  override call() {
    const [iterable, predicate] = this.args;
    this.validateIterable(iterable, "iterable");
    this.validateFunction(predicate, "predicate");

    const iterator = new Iterator([iterable], [], this.environment).call();
    let stopped = false;
    const self = this;

    class NextMethod extends IterMethodBuilder {
      override async call() {
        if (stopped) {
          return { value: null, done: true };
        }

        const current = new iterator.next([], [], this.environment).call();

        if (current.done) {
          return current;
        }

        const shouldTake = await self.executeCallback(predicate, [current.value]);

        if (!shouldTake) {
          stopped = true;
          return { value: null, done: true };
        }

        return current;
      }
    }

    return {
      next: NextMethod,
      async *[Symbol.asyncIterator]() {
        for (const value of iterator) {
          const shouldTake = await self.executeCallback(predicate, [value]);

          if (!shouldTake) {
            break;
          }

          yield value;
        }
      },
    };
  }
}

class DropWhile extends IterMethodBuilder {
  override call() {
    const [iterable, predicate] = this.args;
    this.validateIterable(iterable, "iterable");
    this.validateFunction(predicate, "predicate");

    const iterator = new Iterator([iterable], [], this.environment).call();
    let dropping = true;
    const self = this;

    class NextMethod extends IterMethodBuilder {
      override async call() {
        while (dropping) {
          const current = new iterator.next([], [], this.environment).call();

          if (current.done) {
            return current;
          }

          const shouldDrop = await self.executeCallback(predicate, [current.value]);

          if (!shouldDrop) {
            dropping = false;
            return current;
          }
        }

        return new iterator.next([], [], this.environment).call();
      }
    }

    return {
      next: NextMethod,
      async *[Symbol.asyncIterator]() {
        let drop = true;
        for (const value of iterator) {
          if (drop) {
            const shouldDrop = await self.executeCallback(predicate, [value]);

            if (shouldDrop) {
              continue;
            }
            drop = false;
          }
          yield value;
        }
      },
    };
  }
}

class FilterFalse extends IterMethodBuilder {
  override call() {
    const [iterable, predicate] = this.args;
    this.validateIterable(iterable, "iterable");
    this.validateFunction(predicate, "predicate");

    const iterator = new Iterator([iterable], [], this.environment).call();
    const self = this;

    class NextMethod extends IterMethodBuilder {
      override async call() {
        while (true) {
          const current = new iterator.next([], [], this.environment).call();

          if (current.done) {
            return current;
          }

          const result = await self.executeCallback(predicate, [current.value]);

          if (!result) {
            return current;
          }
        }
      }
    }

    return {
      next: NextMethod,
      async *[Symbol.asyncIterator]() {
        for (const value of iterator) {
          const result = await self.executeCallback(predicate, [value]);

          if (!result) {
            yield value;
          }
        }
      },
    };
  }
}

class Compress extends IterMethodBuilder {
  override call() {
    const [iterable, selectors] = this.args;
    this.validateIterable(iterable, "iterable");
    this.validateIterable(selectors, "selectors");

    const dataIter = new Iterator([iterable], [], this.environment).call();
    const selectorIter = new Iterator([selectors], [], this.environment).call();

    class NextMethod extends IterMethodBuilder {
      override call() {
        while (true) {
          const dataNext = new dataIter.next([], [], this.environment).call();
          const selectorNext = new selectorIter.next([], [], this.environment).call();

          if (dataNext.done || selectorNext.done) {
            return { value: null, done: true };
          }

          if (selectorNext.value) {
            return dataNext;
          }
        }
      }
    }

    return {
      next: NextMethod,
      *[Symbol.iterator]() {
        const data = dataIter[Symbol.iterator]();
        const selector = selectorIter[Symbol.iterator]();

        let dataResult: any = data.next();
        let selectorResult: any = selector.next();

        while (!dataResult.done && !selectorResult.done) {
          if (selectorResult.value) {
            yield dataResult.value;
          }

          dataResult = data.next();
          selectorResult = selector.next();
        }
      },
    };
  }
}

class GroupBy extends IterMethodBuilder {
  override call() {
    const [iterable, keyFunc] = this.args;
    this.validateIterable(iterable, "iterable");

    if (keyFunc !== undefined) {
      this.validateFunction(keyFunc, "keyFunction");
    }

    const iterator = new Iterator([iterable], [], this.environment).call();
    let currentKey: any = Symbol("initial");
    let currentValue: any;
    let exhausted = false;
    const self = this;

    const getKey = async (value: any) => {
      return keyFunc ? await self.executeCallback(keyFunc, [value]) : value;
    };

    class NextMethod extends IterMethodBuilder {
      override async call() {
        if (exhausted) {
          return { value: null, done: true };
        }

        if (currentKey === Symbol("initial")) {
          const first = new iterator.next([], [], this.environment).call();
          if (first.done) {
            exhausted = true;
            return { value: null, done: true };
          }
          currentValue = first.value;
          currentKey = await getKey(currentValue);
        }

        const groupKey = currentKey;
        const group: any[] = [currentValue];

        while (true) {
          const next = new iterator.next([], [], this.environment).call();

          if (next.done) {
            exhausted = true;
            break;
          }

          const nextKey = await getKey(next.value);
          if (nextKey !== currentKey) {
            currentKey = nextKey;
            currentValue = next.value;
            break;
          }

          group.push(next.value);
        }

        const groupIterator = new Iterator([group], [], self.environment).call();
        return { value: { key: groupKey, group: groupIterator }, done: false };
      }
    }

    return {
      next: NextMethod,
      async *[Symbol.asyncIterator]() {
        const items: any[] = [];
        for (const value of iterator) {
          items.push(value);
        }

        if (items.length === 0) return;

        let currentGroupKey = await getKey(items[0]);
        let currentGroupItems: any[] = [];

        for (const item of items) {
          const key = await getKey(item);
          if (key !== currentGroupKey) {
            yield {
              key: currentGroupKey,
              group: new Iterator([currentGroupItems], [], self.environment).call(),
            };
            currentGroupKey = key;
            currentGroupItems = [];
          }
          currentGroupItems.push(item);
        }

        if (currentGroupItems.length > 0) {
          yield {
            key: currentGroupKey,
            group: new Iterator([currentGroupItems], [], self.environment).call(),
          };
        }
      },
    };
  }
}

class Accumulate extends IterMethodBuilder {
  override call() {
    const [iterable, func, initial] = this.args;
    this.validateIterable(iterable, "iterable");

    if (func !== undefined) {
      this.validateFunction(func, "function");
    }

    const iterator = new Iterator([iterable], [], this.environment).call();
    let accumulator: any;
    let first = true;
    const self = this;

    const defaultFunc = (a: any, b: any) => a + b;
    const operation = func || defaultFunc;

    class NextMethod extends IterMethodBuilder {
      override async call() {
        if (first) {
          first = false;
          if (initial !== undefined) {
            accumulator = initial;
            const next = new iterator.next([], [], this.environment).call();
            if (next.done) {
              return { value: accumulator, done: false };
            }
            accumulator = await self.executeCallback(operation, [accumulator, next.value]);
          } else {
            const next = new iterator.next([], [], this.environment).call();
            if (next.done) {
              return { value: null, done: true };
            }
            accumulator = next.value;
          }
          return { value: accumulator, done: false };
        }

        const next = new iterator.next([], [], this.environment).call();
        if (next.done) {
          return { value: null, done: true };
        }

        accumulator = await self.executeCallback(operation, [accumulator, next.value]);
        return { value: accumulator, done: false };
      }
    }

    return {
      next: NextMethod,
      async *[Symbol.asyncIterator]() {
        let acc: any;
        let isFirst = true;

        for (const value of iterator) {
          if (isFirst) {
            acc =
              initial !== undefined
                ? await self.executeCallback(operation, [initial, value])
                : value;
            isFirst = false;
          } else {
            acc = await self.executeCallback(operation, [acc, value]);
          }
          yield acc;
        }

        if (isFirst && initial !== undefined) {
          yield initial;
        }
      },
    };
  }
}

class Pairwise extends IterMethodBuilder {
  override call() {
    const [iterable] = this.args;
    this.validateIterable(iterable, "iterable");

    const iterator = new Iterator([iterable], [], this.environment).call();
    let previous: any = Symbol("none");

    class NextMethod extends IterMethodBuilder {
      override call() {
        if (previous === Symbol("none")) {
          const first = new iterator.next([], [], this.environment).call();
          if (first.done) {
            return { value: null, done: true };
          }
          previous = first.value;
        }

        const current = new iterator.next([], [], this.environment).call();
        if (current.done) {
          return { value: null, done: true };
        }

        const pair: [any, any] = [previous, current.value];
        previous = current.value;
        return { value: pair, done: false };
      }
    }

    return {
      next: NextMethod,
      *[Symbol.iterator]() {
        let prev: any = Symbol("none");
        for (const value of iterator) {
          if (prev !== Symbol("none")) {
            yield [prev, value] as [any, any];
          }
          prev = value;
        }
      },
    };
  }
}

class Flatten extends IterMethodBuilder {
  override call() {
    const [iterable, depth = 1] = this.args;
    this.validateIterable(iterable, "iterable");

    if (depth !== undefined) {
      this.validateNumber(depth, "depth");
      if (depth < 0) {
        throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsTypeError, {
          propsName: "depth",
          expectType: "non-negative number",
          received: "negative",
        });
      }
    }

    const iterator = new Iterator([iterable], [], this.environment).call();
    const self = this;

    const flattenRecursive = function* (iter: any, currentDepth: number): Generator<any> {
      for (const item of iter) {
        const itemType = isTypeArgs(item);
        if (currentDepth > 0 && (itemType === "array" || itemType === "string")) {
          const subIter = new Iterator([item], [], self.environment).call();
          yield* flattenRecursive(subIter, currentDepth - 1);
        } else {
          yield item;
        }
      }
    };

    const generator = flattenRecursive(iterator, depth);

    class NextMethod extends IterMethodBuilder {
      override call() {
        const result = generator.next();
        return result.done ? { value: null, done: true } : { value: result.value, done: false };
      }
    }

    return {
      next: NextMethod,
      *[Symbol.iterator]() {
        yield* flattenRecursive(iterator, depth);
      },
    };
  }
}

module.exports = {
  Iterator,
  range: Range,
  enumerate: Enumerate,
  zip: Zip,
  zipLongest: ZipLongest,
  chain: Chain,
  count: Count,
  cycle: Cycle,
  repeat: Repeat,
  takeWhile: TakeWhile,
  dropWhile: DropWhile,
  filterFalse: FilterFalse,
  compress: Compress,
  groupBy: GroupBy,
  accumulate: Accumulate,
  pairwise: Pairwise,
  flatten: Flatten,
  symbol: Environment.SymbolIterator,
};
