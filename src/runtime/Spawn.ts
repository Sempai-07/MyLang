import { type StmtType } from "../ast/StmtType";
import { Environment } from "../Environment";
import { isTypeArgs } from "../../library/utils/utils";
import { FunctionExpression } from "../ast/expression/FunctionExpression";
import { FunctionDeclaration } from "../ast/declaration/FunctionDeclaration";
import { FunctionBuilder, FunctionBuilderCodeError } from "../../library/FunctionBuilder";
import { isSubclassOfByName } from "../utils/isSubclassOfByName";
import { runtime } from "./Runtime";

class Spawn<T> {
  private _done = false;
  private _cancelled = false;
  private _result?: T;
  private _error: any;
  private _started = false;

  private _resolve!: (val: T) => void;

  private _task: () => T | Promise<T>;
  public readonly promise: Promise<T>;

  private _startTime: number = 0;
  private _endTime: number = 0;

  constructor(task: () => T | Promise<T>) {
    this._task = task;
    this.promise = new Promise<T>((resolve) => {
      this._resolve = resolve;
    });
  }

  run(): void {
    if (this._started || this._cancelled) return;
    this._started = true;
    this._startTime = Date.now();

    (async () => {
      try {
        const result = await this._task();
        if (this._cancelled) return;
        this._done = true;
        this._endTime = Date.now();
        this._result = result;
        this._resolve(result);
      } catch (err) {
        if (this._cancelled) return;
        this._done = true;
        this._endTime = Date.now();
        this._error = err;
        this._resolve(err as unknown as T);
      }
    })();
  }

  cancel(): void {
    if (this._done || this._cancelled) return;
    this._cancelled = true;
    this._endTime = Date.now();
    this._resolve(null as any);
  }

  output(resolve: (val: T) => any, reject?: (err: any) => any): Promise<any> {
    return this.promise.then(resolve, reject);
  }

  get done(): boolean {
    return this._done;
  }

  get result(): any {
    return this._result === undefined ? null : this._result;
  }

  get error(): unknown {
    return this._error || null;
  }

  get status(): "pending" | "fulfilled" | "rejected" | "cancelled" {
    if (this._cancelled) return "cancelled";
    if (!this._done) return "pending";
    return this._error ? "rejected" : "fulfilled";
  }

  get elapsed(): number | null {
    if (!this._started) return null;
    return (this._done || this._cancelled ? this._endTime : Date.now()) - this._startTime;
  }

  isCancelled() {
    return this._cancelled;
  }

  isFinished() {
    return this._done || this._cancelled;
  }
}

function convertSpawnState(handler: Spawn<any>, score: Environment) {
  return {
    done: handler.done,
    result: handler.result,
    error: handler.error,
    status: handler.status,
    elapsed: handler.elapsed,
    cancel: class extends FunctionBuilder {
      constructor(args: any[], astArgs: StmtType[], environment: Environment) {
        super(args, astArgs, environment);
      }

      get pkgInfo() {
        return {
          name: "native",
          path: __dirname,
        };
      }

      async call() {
        return handler.cancel();
      }
    },
    isCancelled: class extends FunctionBuilder {
      constructor(args: any[], astArgs: StmtType[], environment: Environment) {
        super(args, astArgs, environment);
      }

      get pkgInfo() {
        return {
          name: "native",
          path: __dirname,
        };
      }

      async call() {
        return handler.isCancelled();
      }
    },
    isFinished: class extends FunctionBuilder {
      constructor(args: any[], astArgs: StmtType[], environment: Environment) {
        super(args, astArgs, environment);
      }

      get pkgInfo() {
        return {
          name: "native",
          path: __dirname,
        };
      }

      async call() {
        return handler.isFinished();
      }
    },
    output: class extends FunctionBuilder {
      constructor(args: any[], astArgs: StmtType[], environment: Environment) {
        super(args, astArgs, environment);

        if (isTypeArgs(args[0]) !== "function") {
          throw super.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsFirstTypeError, {
            expectType: "func",
            received: isTypeArgs(args[0]),
          });
        }
      }

      get pkgInfo() {
        return {
          name: "native",
          path: __dirname,
        };
      }

      async call() {
        const [resolve, reject] = this.args;

        const runFn = async (fn: any, value: any, score: Environment): Promise<any> => {
          if (fn instanceof FunctionDeclaration || fn instanceof FunctionExpression) {
            runtime.markFunctionCallPosition();
            const callEnv = new Environment(score);

            if (fn.params?.length) {
              const [param] = fn.params[0]!;

              callEnv.create(param, value);
            }

            await fn.body.evaluate(callEnv);

            const res = runtime.getLastExecutionResult();
            runtime.resetLastExecutionResult();
            runtime.finishFunction();

            return res;
          }

          if (isSubclassOfByName(fn, "FunctionBuilder")) {
            return new fn([value], [], score).call();
          }

          throw super.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsFirstTypeError, {
            expectType: "func",
            received: isTypeArgs(fn),
          });
        };

        if (reject) {
          const spawn = new Spawn(() => {
            return handler.output(
              (result) => {
                return runFn(resolve, result, score);
              },
              (err) => {
                return runFn(resolve, err, score);
              },
            );
          });

          runtime.schedulerStack.go(() => spawn.run());

          return convertSpawnState(spawn, this.environment);
        }

        const spawn = new Spawn(() => {
          return handler.output((result) => {
            return runFn(resolve, result, score);
          });
        });

        runtime.schedulerStack.go(() => spawn.run());

        return convertSpawnState(spawn, this.environment);
      }
    },
    [Environment.SpawnQueueSymbol]: handler,
  };
}

export { Spawn, convertSpawnState };
