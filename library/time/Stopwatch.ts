import { TimeMethodBuilder } from "./TimeBuilder";
import { Environment } from "../../src/Environment";

class Stopwatch extends TimeMethodBuilder {
  override call() {
    let startTime: number | null = null;
    let totalElapsed = 0;
    let isRunning = false;
    let splits: Array<{ time: number; elapsed: number }> = [];
    let intervals: NodeJS.Timeout[] = [];

    return {
      start: class extends TimeMethodBuilder {
        override call() {
          if (isRunning) {
            return false;
          }
          startTime = performance.now();
          isRunning = true;
          return true;
        }
      },

      stop: class extends TimeMethodBuilder {
        override call() {
          if (!isRunning || startTime === null) {
            return false;
          }
          totalElapsed += performance.now() - startTime;
          isRunning = false;
          startTime = null;

          intervals.forEach(clearInterval);
          intervals.length = 0;

          return true;
        }
      },

      reset: class extends TimeMethodBuilder {
        override call() {
          isRunning = false;
          startTime = null;
          totalElapsed = 0;
          splits.length = 0;

          intervals.forEach(clearInterval);
          intervals.length = 0;

          return null;
        }
      },

      restart: class extends TimeMethodBuilder {
        override call() {
          isRunning = false;
          startTime = null;
          totalElapsed = 0;
          splits.length = 0;

          intervals.forEach(clearInterval);
          intervals.length = 0;

          startTime = performance.now();
          isRunning = true;
          return true;
        }
      },

      elapsed: class extends TimeMethodBuilder {
        override call() {
          if (isRunning && startTime !== null) {
            return totalElapsed + (performance.now() - startTime);
          }
          return totalElapsed;
        }
      },

      elapsedSeconds: class extends TimeMethodBuilder {
        override call() {
          const elapsed =
            isRunning && startTime !== null
              ? totalElapsed + (performance.now() - startTime)
              : totalElapsed;
          return elapsed / 1000;
        }
      },

      isRunning: class extends TimeMethodBuilder {
        override call() {
          return isRunning;
        }
      },

      split: class extends TimeMethodBuilder {
        override call() {
          const currentTime = performance.now();
          const elapsed =
            isRunning && startTime !== null
              ? totalElapsed + (currentTime - startTime)
              : totalElapsed;

          const split = { time: currentTime, elapsed };
          splits.push(split);
          return elapsed;
        }
      },

      splits: class extends TimeMethodBuilder {
        override call() {
          return splits.map((s) => ({
            elapsed: s.elapsed,
            timestamp: s.time,
          }));
        }
      },

      lastSplit: class extends TimeMethodBuilder {
        override call() {
          if (splits.length === 0) return null;
          const last = splits[splits.length - 1]!;
          return {
            elapsed: last.elapsed,
            timestamp: last.time,
          };
        }
      },

      splitTime: class extends TimeMethodBuilder {
        override call() {
          if (splits.length === 0) return 0;

          const currentElapsed =
            isRunning && startTime !== null
              ? totalElapsed + (performance.now() - startTime)
              : totalElapsed;

          const lastSplit = splits[splits.length - 1]!;
          return currentElapsed - lastSplit.elapsed;
        }
      },

      onInterval: class extends TimeMethodBuilder {
        override call() {
          const [callback, intervalMs = 1000] = this.args;
          this.validateFunction(callback, "callback");
          this.validateNumber(intervalMs, "interval");

          const interval = setInterval(() => {
            const elapsed =
              isRunning && startTime !== null
                ? totalElapsed + (performance.now() - startTime)
                : totalElapsed;
            this.executeCallback(callback, [elapsed]);
          }, intervalMs);

          intervals.push(interval);
          return interval;
        }
      },

      clearInterval: class extends TimeMethodBuilder {
        override call() {
          const [intervalId] = this.args;
          const index = intervals.indexOf(intervalId);
          if (index > -1) {
            clearInterval(intervalId);
            intervals.splice(index, 1);
          }
          return null;
        }
      },

      clearAllIntervals: class extends TimeMethodBuilder {
        override call() {
          intervals.forEach(clearInterval);
          intervals.length = 0;
          return null;
        }
      },

      waitFor: class extends TimeMethodBuilder {
        override async call() {
          const [targetMs] = this.args;
          this.validateNumber(targetMs, "target");

          return new Promise((resolve) => {
            const check = () => {
              const elapsed =
                isRunning && startTime !== null
                  ? totalElapsed + (performance.now() - startTime)
                  : totalElapsed;

              if (elapsed >= targetMs) {
                resolve(elapsed);
              } else {
                setTimeout(check, 10);
              }
            };
            check();
          });
        }
      },

      averageSplitTime: class extends TimeMethodBuilder {
        override call() {
          if (splits.length < 2) return 0;

          let totalSplitTime = 0;
          for (let i = 1; i < splits.length; i++) {
            totalSplitTime += splits[i]!.elapsed - splits[i - 1]!.elapsed;
          }

          return totalSplitTime / (splits.length - 1);
        }
      },

      fastestSplit: class extends TimeMethodBuilder {
        override call() {
          if (splits.length < 2) return null;

          let fastest = Infinity;
          let fastestIndex = -1;

          for (let i = 1; i < splits.length; i++) {
            const splitTime = splits[i]!.elapsed - splits[i - 1]!.elapsed;
            if (splitTime < fastest) {
              fastest = splitTime;
              fastestIndex = i;
            }
          }

          return {
            time: fastest,
            splitIndex: fastestIndex,
            elapsed: splits[fastestIndex]!.elapsed,
          };
        }
      },

      slowestSplit: class extends TimeMethodBuilder {
        override call() {
          if (splits.length < 2) return null;

          let slowest = -1;
          let slowestIndex = -1;

          for (let i = 1; i < splits.length; i++) {
            const splitTime = splits[i]!.elapsed - splits[i - 1]!.elapsed;
            if (splitTime > slowest) {
              slowest = splitTime;
              slowestIndex = i;
            }
          }

          return {
            time: slowest,
            splitIndex: slowestIndex,
            elapsed: splits[slowestIndex]!.elapsed,
          };
        }
      },

      format: class extends TimeMethodBuilder {
        override call() {
          const [template = "mm:ss.fff"] = this.args;
          this.validateString(template, "template");

          const elapsed =
            isRunning && startTime !== null
              ? totalElapsed + (performance.now() - startTime)
              : totalElapsed;

          const hours = Math.floor(elapsed / (1000 * 60 * 60));
          const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);
          const milliseconds = Math.floor(elapsed % 1000);

          const pad = (num: number, length = 2) => num.toString().padStart(length, "0");

          return template
            .replace(/HH/g, pad(hours))
            .replace(/H/g, hours.toString())
            .replace(/mm/g, pad(minutes))
            .replace(/m/g, minutes.toString())
            .replace(/ss/g, pad(seconds))
            .replace(/s/g, seconds.toString())
            .replace(/fff/g, pad(milliseconds, 3))
            .replace(/f/g, milliseconds.toString());
        }
      },

      toString: class extends TimeMethodBuilder {
        override call() {
          const elapsed =
            isRunning && startTime !== null
              ? totalElapsed + (performance.now() - startTime)
              : totalElapsed;

          const minutes = Math.floor(elapsed / (1000 * 60));
          const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);
          const ms = Math.floor(elapsed % 1000);

          const pad = (num: number, length = 2) => num.toString().padStart(length, "0");

          return `${pad(minutes)}:${pad(seconds)}.${pad(ms, 3)}`;
        }
      },

      [Environment.SymbolFormatedText]: `Stopwatch { ${isRunning ? "running" : "stopped"}, splits: ${splits.length} }`,
    };
  }
}

export { Stopwatch };
