import { TimeMethodBuilder } from "./TimeBuilder";
import { Environment } from "../../src/Environment";
import { isTypeArgs } from "../utils/utils";

class Duration extends TimeMethodBuilder {
  override call() {
    const [milliseconds = 0] = this.args;

    let totalMs: number;

    if (isTypeArgs(milliseconds) === "object") {
      const { days = 0, hours = 0, minutes = 0, seconds = 0, milliseconds: ms = 0 } = milliseconds;

      totalMs =
        days * 24 * 60 * 60 * 1000 +
        hours * 60 * 60 * 1000 +
        minutes * 60 * 1000 +
        seconds * 1000 +
        ms;
    } else {
      this.validateNumber(milliseconds);
      totalMs = milliseconds;
    }

    return {
      totalMilliseconds: totalMs,

      totalSeconds: totalMs / 1000,

      totalMinutes: totalMs / (1000 * 60),

      totalHours: totalMs / (1000 * 60 * 60),

      totalDays: totalMs / (1000 * 60 * 60 * 24),

      days: class extends TimeMethodBuilder {
        override call() {
          return Math.floor(Math.abs(totalMs) / (1000 * 60 * 60 * 24));
        }
      },

      hours: class extends TimeMethodBuilder {
        override call() {
          return Math.floor((Math.abs(totalMs) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        }
      },

      minutes: class extends TimeMethodBuilder {
        override call() {
          return Math.floor((Math.abs(totalMs) % (1000 * 60 * 60)) / (1000 * 60));
        }
      },

      seconds: class extends TimeMethodBuilder {
        override call() {
          return Math.floor((Math.abs(totalMs) % (1000 * 60)) / 1000);
        }
      },

      milliseconds: class extends TimeMethodBuilder {
        override call() {
          return Math.floor(Math.abs(totalMs) % 1000);
        }
      },

      add: class extends TimeMethodBuilder {
        override call() {
          const [other] = this.args;
          if (typeof other === "object" && "totalMilliseconds" in other) {
            return new Duration([totalMs + other.totalMilliseconds], [], this.environment).call();
          } else {
            this.validateNumber(other, "duration");
            return new Duration([totalMs + other], [], this.environment).call();
          }
        }
      },

      subtract: class extends TimeMethodBuilder {
        override call() {
          const [other] = this.args;
          if (typeof other === "object" && "totalMilliseconds" in other) {
            return new Duration([totalMs - other.totalMilliseconds], [], this.environment).call();
          } else {
            this.validateNumber(other, "duration");
            return new Duration([totalMs - other], [], this.environment).call();
          }
        }
      },

      multiply: class extends TimeMethodBuilder {
        override call() {
          const [factor] = this.args;
          this.validateNumber(factor, "factor");
          return new Duration([totalMs * factor], [], this.environment).call();
        }
      },

      divide: class extends TimeMethodBuilder {
        override call() {
          const [divisor] = this.args;
          this.validateNumber(divisor, "divisor");
          if (divisor === 0) {
            throw this.throwErrorFormatters(new Error("Division by zero"));
          }
          return new Duration([totalMs / divisor], [], this.environment).call();
        }
      },

      isEqual: class extends TimeMethodBuilder {
        override call() {
          const [other] = this.args;
          if (typeof other === "object" && "totalMilliseconds" in other) {
            return totalMs === other.totalMilliseconds;
          } else {
            this.validateNumber(other, "duration");
            return totalMs === other;
          }
        }
      },

      isLessThan: class extends TimeMethodBuilder {
        override call() {
          const [other] = this.args;
          if (typeof other === "object" && "totalMilliseconds" in other) {
            return totalMs < other.totalMilliseconds;
          } else {
            this.validateNumber(other, "duration");
            return totalMs < other;
          }
        }
      },

      isGreaterThan: class extends TimeMethodBuilder {
        override call() {
          const [other] = this.args;
          if (typeof other === "object" && "totalMilliseconds" in other) {
            return totalMs > other.totalMilliseconds;
          } else {
            this.validateNumber(other, "duration");
            return totalMs > other;
          }
        }
      },

      isPositive: class extends TimeMethodBuilder {
        override call() {
          return totalMs > 0;
        }
      },

      isNegative: class extends TimeMethodBuilder {
        override call() {
          return totalMs < 0;
        }
      },

      isZero: class extends TimeMethodBuilder {
        override call() {
          return totalMs === 0;
        }
      },

      abs: class extends TimeMethodBuilder {
        override call() {
          return new Duration([Math.abs(totalMs)], [], this.environment).call();
        }
      },

      negate: class extends TimeMethodBuilder {
        override call() {
          return new Duration([-totalMs], [], this.environment).call();
        }
      },

      format: class extends TimeMethodBuilder {
        override call() {
          const [template = "HH:mm:ss"] = this.args;
          this.validateString(template, "template");

          const isNegative = totalMs < 0;
          const absMs = Math.abs(totalMs);

          const days = Math.floor(absMs / (1000 * 60 * 60 * 24));
          const hours = Math.floor((absMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((absMs % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((absMs % (1000 * 60)) / 1000);
          const ms = Math.floor(absMs % 1000);

          const pad = (num: number, length = 2) => num.toString().padStart(length, "0");

          let result = template
            .replace(/DD/g, pad(days))
            .replace(/D/g, days.toString())
            .replace(/HH/g, pad(hours))
            .replace(/H/g, hours.toString())
            .replace(/mm/g, pad(minutes))
            .replace(/m/g, minutes.toString())
            .replace(/ss/g, pad(seconds))
            .replace(/s/g, seconds.toString())
            .replace(/fff/g, pad(ms, 3))
            .replace(/f/g, ms.toString());

          return isNegative ? `-${result}` : result;
        }
      },

      toString: class extends TimeMethodBuilder {
        override call() {
          const isNegative = totalMs < 0;
          const absMs = Math.abs(totalMs);

          const days = Math.floor(absMs / (1000 * 60 * 60 * 24));
          const hours = Math.floor((absMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((absMs % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((absMs % (1000 * 60)) / 1000);
          const ms = Math.floor(absMs % 1000);

          const parts = [];
          if (days > 0) parts.push(`${days}d`);
          if (hours > 0) parts.push(`${hours}h`);
          if (minutes > 0) parts.push(`${minutes}m`);
          if (seconds > 0 || ms > 0) {
            if (ms > 0) {
              parts.push(`${seconds}.${ms.toString().padStart(3, "0")}s`);
            } else {
              parts.push(`${seconds}s`);
            }
          }

          const result = parts.length > 0 ? parts.join(" ") : "0s";
          return isNegative ? `-${result}` : result;
        }
      },

      [Environment.SymbolFormatedText]: `Duration { ${totalMs}ms }`,
    };
  }
}

export { Duration };
