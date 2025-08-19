import { EventMethodBuilder } from "./EventsBuilder";
import { Environment } from "../../src/Environment";
import { type FunctionBuilder } from "../FunctionBuilder";
import { isTypeArgs } from "../utils/utils";

interface IObservable {
  next: typeof FunctionBuilder;
  error: Error | null;
  complete: typeof FunctionBuilder | null;
}

class Observable extends EventMethodBuilder {
  override call() {
    const observers: IObservable[] = [];
    let completed = false;
    let errorOccurred = false;
    let lastError: Error | null = null;

    return {
      subscribe: class extends EventMethodBuilder {
        override call() {
          const [observerOrNext, error, complete] = this.args;

          let observer;

          if (isTypeArgs(observerOrNext) === "object" && observerOrNext.next) {
            observer = observerOrNext;
          } else {
            this.validateFunction(observerOrNext, "next");
            observer = {
              next: observerOrNext,
              error: error || null,
              complete: complete || null,
            };
          }

          if (completed || errorOccurred) {
            if (errorOccurred && observer.error) {
              this.executeListener(observer.error, [lastError]);
            } else if (completed && observer.complete) {
              this.executeListener(observer.complete, []);
            }
            return {
              unsubscribe: class extends EventMethodBuilder {
                override call() {
                  return {};
                }
              },
            };
          }

          observers.push(observer);

          return {
            unsubscribe: class extends EventMethodBuilder {
              override call() {
                const index = observers.indexOf(observer);
                if (index !== -1) {
                  observers.splice(index, 1);
                }
              }
            },
          };
        }
      },

      next: class extends EventMethodBuilder {
        override async call() {
          const [value] = this.args;

          if (completed || errorOccurred) {
            return new Observable([], [], this.environment).call();
          }

          for (const observer of observers) {
            if (observer.next) {
              try {
                await this.executeListener(observer.next, [value]);
              } catch (err) {
                if (observer.error) {
                  await this.executeListener(observer.error, [err]);
                } else {
                  console.error("Unhandled error in observer:", err);
                }
              }
            }
          }

          return new Observable([], [], this.environment).call();
        }
      },

      error: class extends EventMethodBuilder {
        override async call() {
          const [err] = this.args;

          if (completed || errorOccurred) {
            return new Observable([], [], this.environment).call();
          }

          errorOccurred = true;
          lastError = err;

          for (const observer of observers) {
            if (observer.error) {
              try {
                await this.executeListener(observer.error, [err]);
              } catch (e) {
                console.error("Error in error handler:", e);
              }
            }
          }

          observers.length = 0;
          return new Observable([], [], this.environment).call();
        }
      },

      complete: class extends EventMethodBuilder {
        override async call() {
          if (completed || errorOccurred) {
            return new Observable([], [], this.environment).call();
          }

          completed = true;

          for (const observer of observers) {
            if (observer.complete) {
              try {
                await this.executeListener(observer.complete, []);
              } catch (err) {
                console.error("Error in complete handler:", err);
              }
            }
          }

          observers.length = 0;
          return new Observable([], [], this.environment).call();
        }
      },

      map: class extends EventMethodBuilder {
        override call() {
          const [mapFunc] = this.args;
          this.validateFunction(mapFunc, "mapper");

          return new Observable([], [], this.environment).call();
        }
      },

      filter: class extends EventMethodBuilder {
        override call() {
          const [predicate] = this.args;
          this.validateFunction(predicate, "predicate");

          return new Observable([], [], this.environment).call();
        }
      },

      pipe: class extends EventMethodBuilder {
        override call() {
          const operators = this.args;

          for (const op of operators) {
            this.validateFunction(op, "operator");
          }

          return new Observable([], [], this.environment).call();
        }
      },

      isCompleted: class extends EventMethodBuilder {
        override call() {
          return completed;
        }
      },

      hasError: class extends EventMethodBuilder {
        override call() {
          return errorOccurred;
        }
      },

      getError: class extends EventMethodBuilder {
        override call() {
          return lastError;
        }
      },

      observerCount: class extends EventMethodBuilder {
        override call() {
          return observers.length;
        }
      },

      [Environment.SymbolFormatedText]: `Observable { observers: ${observers.length}, completed: ${completed}, error: ${errorOccurred} }`,
    };
  }
}

export { Observable };
