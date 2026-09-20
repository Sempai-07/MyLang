import { TimeMethodBuilder } from "./TimeBuilder";
import { Environment } from "../../src/Environment";

class Sleep extends TimeMethodBuilder {
  override async call() {
    const [ms = 1000] = this.args;
    this.validateNumber(ms, "milliseconds");

    if (ms < 0) {
      throw this.throwErrorFormatters(new Error("Sleep time cannot be negative"));
    }

    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

class Delay extends TimeMethodBuilder {
  override call() {
    const [callback, ms = 0] = this.args;
    this.validateFunction(callback, "callback");
    this.validateNumber(ms, "delay");

    return {
      start: class extends TimeMethodBuilder {
        override call() {
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              try {
                const result = this.executeCallback(callback, []);
                resolve(result);
              } catch (error) {
                reject(error);
              }
            }, ms);
          });
        }
      },

      cancel: class extends TimeMethodBuilder {
        private timeoutId: NodeJS.Timeout | null = null;

        override call() {
          if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
            return true;
          }
          return false;
        }
      },

      [Environment.SymbolFormatedText]: `Delay { ${ms}ms }`,
    };
  }
}

class Debounce extends TimeMethodBuilder {
  override call() {
    const [func, wait = 300, immediate = false] = this.args;
    this.validateFunction(func, "function");
    this.validateNumber(wait, "wait");

    let timeout: NodeJS.Timeout | null = null;

    return {
      execute: class extends TimeMethodBuilder {
        override call() {
          const callNow = immediate && !timeout;

          if (timeout) {
            clearTimeout(timeout);
          }

          timeout = setTimeout(() => {
            timeout = null;
            if (!immediate) {
              this.executeCallback(func, this.args);
            }
          }, wait);

          if (callNow) {
            this.executeCallback(func, this.args);
          }

          return null;
        }
      },

      cancel: class extends TimeMethodBuilder {
        override call() {
          if (timeout) {
            clearTimeout(timeout);
            timeout = null;
            return true;
          }
          return false;
        }
      },

      flush: class extends TimeMethodBuilder {
        override call() {
          if (timeout) {
            clearTimeout(timeout);
            timeout = null;
            this.executeCallback(func, this.args);
            return true;
          }
          return false;
        }
      },

      pending: class extends TimeMethodBuilder {
        override call() {
          return timeout !== null;
        }
      },

      [Environment.SymbolFormatedText]: `Debounce { wait: ${wait}ms, immediate: ${immediate} }`,
    };
  }
}

class Throttle extends TimeMethodBuilder {
  override call() {
    const [func, limit = 100] = this.args;
    this.validateFunction(func, "function");
    this.validateNumber(limit, "limit");

    let lastCall = 0;
    let timeout: NodeJS.Timeout | null = null;

    return {
      execute: class extends TimeMethodBuilder {
        override call() {
          const now = Date.now();

          if (now - lastCall >= limit) {
            lastCall = now;
            this.executeCallback(func, this.args);
          } else if (!timeout) {
            timeout = setTimeout(
              () => {
                lastCall = Date.now();
                this.executeCallback(func, this.args);
                timeout = null;
              },
              limit - (now - lastCall),
            );
          }

          return null;
        }
      },

      cancel: class extends TimeMethodBuilder {
        override call() {
          if (timeout) {
            clearTimeout(timeout);
            timeout = null;
            return true;
          }
          return false;
        }
      },

      [Environment.SymbolFormatedText]: `Throttle { limit: ${limit}ms }`,
    };
  }
}

class Interval extends TimeMethodBuilder {
  override call() {
    const [callback, ms = 1000] = this.args;
    this.validateFunction(callback, "callback");
    this.validateNumber(ms, "interval");

    let intervalId: NodeJS.Timeout | null = null;
    let isRunning = false;
    let executionCount = 0;

    return {
      start: class extends TimeMethodBuilder {
        override call() {
          if (isRunning) {
            return false;
          }

          isRunning = true;
          intervalId = setInterval(() => {
            executionCount++;
            this.executeCallback(callback, [executionCount]);
          }, ms);

          return true;
        }
      },

      stop: class extends TimeMethodBuilder {
        override call() {
          if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
            isRunning = false;
            return true;
          }
          return false;
        }
      },

      reset: class extends TimeMethodBuilder {
        override call() {
          if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
          }
          isRunning = false;
          executionCount = 0;
          return null;
        }
      },

      isRunning: class extends TimeMethodBuilder {
        override call() {
          return isRunning;
        }
      },

      executionCount: class extends TimeMethodBuilder {
        override call() {
          return executionCount;
        }
      },

      [Environment.SymbolFormatedText]: `Interval { ${ms}ms, running: ${isRunning}, executions: ${executionCount} }`,
    };
  }
}

class Timeout extends TimeMethodBuilder {
  override call() {
    const [callback, ms = 0] = this.args;
    this.validateFunction(callback, "callback");
    this.validateNumber(ms, "timeout");

    let timeoutId: NodeJS.Timeout | null = null;
    let hasExecuted = false;
    let isCancelled = false;

    return {
      start: class extends TimeMethodBuilder {
        override call() {
          if (timeoutId || hasExecuted || isCancelled) {
            return false;
          }

          timeoutId = setTimeout(() => {
            hasExecuted = true;
            this.executeCallback(callback, []);
          }, ms);

          return true;
        }
      },

      cancel: class extends TimeMethodBuilder {
        override call() {
          if (timeoutId && !hasExecuted) {
            clearTimeout(timeoutId);
            timeoutId = null;
            isCancelled = true;
            return true;
          }
          return false;
        }
      },

      hasExecuted: class extends TimeMethodBuilder {
        override call() {
          return hasExecuted;
        }
      },

      isCancelled: class extends TimeMethodBuilder {
        override call() {
          return isCancelled;
        }
      },

      isPending: class extends TimeMethodBuilder {
        override call() {
          return timeoutId !== null && !hasExecuted && !isCancelled;
        }
      },

      [Environment.SymbolFormatedText]: `Timeout { ${ms}ms, executed: ${hasExecuted}, cancelled: ${isCancelled} }`,
    };
  }
}

export { Sleep, Delay, Debounce, Throttle, Interval, Timeout };
