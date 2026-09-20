import { FunctionBuilder, FunctionBuilderCodeError } from "../FunctionBuilder";
import { Environment } from "../../src/Environment";
import { type StmtType } from "../../src/ast/StmtType";
import { isTypeArgs } from "../utils/utils";
import { isSubclassOfByName } from "../../src/utils/isSubclassOfByName";
import { runtime } from "../../src/runtime/Runtime";
import { Scheduler } from "../../src/runtime/Scheduler";
import { Spawn, convertSpawnState } from "../../src/runtime/Spawn";
import { FunctionExpression } from "../../src/ast/expression/FunctionExpression";
import { FunctionDeclaration } from "../../src/ast/declaration/FunctionDeclaration";

abstract class RuntimeMethodBuilder extends FunctionBuilder {
  constructor(args: any[], astArgs: StmtType[], environment: Environment) {
    super(args, astArgs, environment);
  }

  get pkgInfo() {
    return {
      name: "runtime",
      path: __dirname,
    };
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

  protected validateNumber(value: any, argName: string): void {
    if (isTypeArgs(value) !== "int") {
      throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsTypeError, {
        propsName: argName,
        expectType: "int",
        received: isTypeArgs(value),
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

class SchedulerBuilder extends RuntimeMethodBuilder {
  override call() {
    const [maxConcurrency = 1] = this.args;
    this.validateNumber(maxConcurrency, "maxConcurrency");

    const scheduler = new Scheduler(maxConcurrency);

    return {
      go: class extends RuntimeMethodBuilder {
        override async call() {
          const [callback] = this.args;
          this.validateFunction(callback);

          return scheduler.go(async () => {
            await this.executeCallback(callback, []);
          });
        }
      },

      schedule: class extends RuntimeMethodBuilder {
        override async call() {
          const [callback] = this.args;
          this.validateFunction(callback);

          return scheduler.schedule(async () => {
            await this.executeCallback(callback, []);
          });
        }
      },

      scheduleFirst: class extends RuntimeMethodBuilder {
        override async call() {
          const [callback] = this.args;
          this.validateFunction(callback);

          return scheduler.scheduleFirst(async () => {
            await this.executeCallback(callback, []);
          });
        }
      },

      scheduleDelayed: class extends RuntimeMethodBuilder {
        override async call() {
          const [callback, delayMs] = this.args;
          this.validateFunction(callback);
          this.validateNumber(delayMs, "delayMs");

          return scheduler.scheduleDelayed(async () => {
            await this.executeCallback(callback, []);
          }, delayMs);
        }
      },

      scheduleRepeating: class extends RuntimeMethodBuilder {
        override call() {
          const [callback, intervalMs, maxRuns] = this.args;
          this.validateFunction(callback);
          this.validateNumber(intervalMs, "intervalMs");

          if (maxRuns !== undefined) {
            this.validateNumber(maxRuns, "maxRuns");
          }

          const { cancel } = scheduler.scheduleRepeating(
            async () => {
              await this.executeCallback(callback, []);
            },
            intervalMs,
            maxRuns,
          );

          return {
            cancel: class extends RuntimeMethodBuilder {
              override call() {
                cancel();
                return null;
              }
            },
          };
        }
      },

      clear: class extends RuntimeMethodBuilder {
        override call() {
          scheduler.clear();
          return null;
        }
      },

      cancelAll: class extends RuntimeMethodBuilder {
        override call() {
          scheduler.cancelAll();
          return null;
        }
      },

      queueSize: scheduler.queueSize,

      isRunning: scheduler.isRunning,

      waitForIdle: class extends RuntimeMethodBuilder {
        override async call() {
          await scheduler.waitForIdle();
          return null;
        }
      },

      [Environment.SymbolFormatedText]: `Scheduler {concurrency: ${scheduler["maxConcurrency"]}, queue: ${scheduler.queueSize}, active: ${scheduler["activeCount"]} }`,
    };
  }
}

class RuntimeGo extends RuntimeMethodBuilder {
  override async call() {
    const [callback] = this.args;
    this.validateFunction(callback);

    return runtime.schedulerStack.go(async () => {
      await this.executeCallback(callback, []);
    });
  }
}

class RuntimeSchedule extends RuntimeMethodBuilder {
  override async call() {
    const [callback] = this.args;
    this.validateFunction(callback);

    return runtime.schedulerStack.schedule(async () => {
      await this.executeCallback(callback, []);
    });
  }
}

class RuntimeScheduleFirst extends RuntimeMethodBuilder {
  override async call() {
    const [callback] = this.args;
    this.validateFunction(callback);

    return runtime.schedulerStack.scheduleFirst(async () => {
      await this.executeCallback(callback, []);
    });
  }
}

class RuntimeScheduleDelayed extends RuntimeMethodBuilder {
  override async call() {
    const [callback, delayMs] = this.args;
    this.validateFunction(callback);
    this.validateNumber(delayMs, "delayMs");

    return runtime.schedulerStack.scheduleDelayed(async () => {
      await this.executeCallback(callback, []);
    }, delayMs);
  }
}

class RuntimeWaitForIdle extends RuntimeMethodBuilder {
  override async call() {
    return runtime.schedulerStack.waitForIdle();
  }
}

class RuntimeScheduleRepeating extends RuntimeMethodBuilder {
  override call() {
    const [callback, intervalMs, maxRuns] = this.args;
    this.validateFunction(callback);
    this.validateNumber(intervalMs, "intervalMs");

    if (maxRuns !== undefined) {
      this.validateNumber(maxRuns, "maxRuns");
    }

    const { cancel } = runtime.schedulerStack.scheduleRepeating(
      async () => {
        await this.executeCallback(callback, []);
      },
      intervalMs,
      maxRuns,
    );

    return {
      cancel: class extends RuntimeMethodBuilder {
        override call() {
          cancel();
          return null;
        }
      },
    };
  }
}

class RuntimeSpawn extends RuntimeMethodBuilder {
  override call() {
    const [callbackFunc] = this.args;
    this.validateFunction(callbackFunc);

    const handler = new Spawn(async () => {
      return this.executeCallback(callbackFunc, []);
    });

    return {
      done: handler.done,
      result: handler.result,
      error: handler.error,
      status: handler.status,
      elapsed: handler.elapsed,
      run: class extends RuntimeMethodBuilder {
        override call() {
          return handler.run();
        }
      },
      cancel: class extends RuntimeMethodBuilder {
        override call() {
          return handler.cancel();
        }
      },
      isCancelled: class extends RuntimeMethodBuilder {
        override call() {
          return handler.isCancelled();
        }
      },
      isFinished: class extends RuntimeMethodBuilder {
        override call() {
          return handler.isFinished();
        }
      },
      output: class extends RuntimeMethodBuilder {
        override call() {
          const [resolve, reject] = this.args;

          if (isTypeArgs(resolve) !== "function") {
            throw super.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsFirstTypeError, {
              expectType: "func",
              received: isTypeArgs(resolve),
            });
          }

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
              return new fn([value], [], this.environment).call();
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
                  return runFn(resolve, result, this.environment);
                },
                (err) => {
                  return runFn(resolve, err, this.environment);
                },
              );
            });

            runtime.schedulerStack.go(() => spawn.run());

            return convertSpawnState(spawn, this.environment);
          }

          const spawn = new Spawn(() => {
            return handler.output((result) => {
              return runFn(resolve, result, this.environment);
            });
          });

          runtime.schedulerStack.go(() => spawn.run());

          return convertSpawnState(spawn, this.environment);
        }
      },
      [Environment.SpawnQueueSymbol]: handler,
    };
  }
}

module.exports = {
  Spawn: RuntimeSpawn,
  Scheduler: SchedulerBuilder,
  go: RuntimeGo,
  schedule: RuntimeSchedule,
  scheduleFirst: RuntimeScheduleFirst,
  scheduleDelayed: RuntimeScheduleDelayed,
  waitForIdle: RuntimeWaitForIdle,
  scheduleRepeating: RuntimeScheduleRepeating,
};
