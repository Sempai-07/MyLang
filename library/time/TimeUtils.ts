import { TimeMethodBuilder } from "./TimeBuilder";
import { Environment } from "../../src/Environment";

class TimeUtils extends TimeMethodBuilder {
  override call() {
    return {
      now: class extends TimeMethodBuilder {
        override call() {
          return Date.now();
        }
      },

      timestamp: class extends TimeMethodBuilder {
        override call() {
          return Math.floor(Date.now() / 1000);
        }
      },

      microtime: class extends TimeMethodBuilder {
        override call() {
          return performance.now() * 1000;
        }
      },

      parse: class extends TimeMethodBuilder {
        override call() {
          const [input, format] = this.args;

          if (typeof input === "string") {
            if (format) {
              this.validateString(format, "format");
              return this.parseWithFormat(input, format);
            } else {
              const date = new Date(input);
              if (isNaN(date.getTime())) {
                throw this.throwErrorFormatters(new Error(`Invalid date string: ${input}`));
              }
              return date;
            }
          } else if (typeof input === "number") {
            return new Date(input > 1e10 ? input : input * 1000);
          } else {
            throw this.throwErrorFormatters(new Error("Input must be string or number"));
          }
        }

        private parseWithFormat(dateStr: string, format: string): Date {
          const formatMap: { [key: string]: string } = {
            YYYY: "(\\d{4})",
            YY: "(\\d{2})",
            MM: "(\\d{1,2})",
            DD: "(\\d{1,2})",
            HH: "(\\d{1,2})",
            mm: "(\\d{1,2})",
            ss: "(\\d{1,2})",
          };

          let regex = format;
          const groups: string[] = [];

          for (const [token, pattern] of Object.entries(formatMap)) {
            if (format.includes(token)) {
              regex = regex.replace(new RegExp(token, "g"), pattern);
              groups.push(token);
            }
          }

          const match = dateStr.match(new RegExp(regex));
          if (!match) {
            throw this.throwErrorFormatters(new Error(`Date string doesn't match format`));
          }

          const values: { [key: string]: number } = {};

          groups.forEach((token, index) => {
            values[token] = parseInt(match[index + 1]!);
          });

          const year =
            values["YYYY"] || (values["YY"] ? 2000 + values["YY"] : new Date().getFullYear());
          const month = (values["MM"] || 1) - 1;
          const day = values["DD"] || 1;
          const hour = values["HH"] || 0;
          const minute = values["mm"] || 0;
          const second = values["ss"] || 0;

          return new Date(year, month, day, hour, minute, second);
        }
      },

      format: class extends TimeMethodBuilder {
        override call() {
          const [date, template = "YYYY-MM-DD HH:mm:ss"] = this.args;
          this.validateDate(date, "date");
          this.validateString(template, "template");

          const pad = (num: number, length = 2) => num.toString().padStart(length, "0");

          return template
            .replace(/YYYY/g, date.getFullYear().toString())
            .replace(/YY/g, (date.getFullYear() % 100).toString().padStart(2, "0"))
            .replace(/MM/g, pad(date.getMonth() + 1))
            .replace(/M/g, (date.getMonth() + 1).toString())
            .replace(/DD/g, pad(date.getDate()))
            .replace(/D/g, date.getDate().toString())
            .replace(/HH/g, pad(date.getHours()))
            .replace(/H/g, date.getHours().toString())
            .replace(/mm/g, pad(date.getMinutes()))
            .replace(/m/g, date.getMinutes().toString())
            .replace(/ss/g, pad(date.getSeconds()))
            .replace(/s/g, date.getSeconds().toString())
            .replace(/fff/g, pad(date.getMilliseconds(), 3))
            .replace(/f/g, date.getMilliseconds().toString());
        }
      },

      fromNow: class extends TimeMethodBuilder {
        override call() {
          const [date] = this.args;
          this.validateDate(date, "date");

          const now = new Date();
          const diff = now.getTime() - date.getTime();
          const absDiff = Math.abs(diff);
          const future = diff < 0;

          const units = [
            { name: "year", ms: 365 * 24 * 60 * 60 * 1000 },
            { name: "month", ms: 30 * 24 * 60 * 60 * 1000 },
            { name: "week", ms: 7 * 24 * 60 * 60 * 1000 },
            { name: "day", ms: 24 * 60 * 60 * 1000 },
            { name: "hour", ms: 60 * 60 * 1000 },
            { name: "minute", ms: 60 * 1000 },
            { name: "second", ms: 1000 },
          ];

          for (const unit of units) {
            const value = Math.floor(absDiff / unit.ms);
            if (value >= 1) {
              const plural = value > 1 ? "s" : "";
              return future
                ? `in ${value} ${unit.name}${plural}`
                : `${value} ${unit.name}${plural} ago`;
            }
          }

          return "just now";
        }
      },

      toNow: class extends TimeMethodBuilder {
        override call() {
          const [date] = this.args;
          this.validateDate(date, "date");

          const now = new Date();
          const diff = date.getTime() - now.getTime();

          if (diff <= 0) {
            return "now";
          }

          const units = [
            { name: "year", ms: 365 * 24 * 60 * 60 * 1000 },
            { name: "month", ms: 30 * 24 * 60 * 60 * 1000 },
            { name: "week", ms: 7 * 24 * 60 * 60 * 1000 },
            { name: "day", ms: 24 * 60 * 60 * 1000 },
            { name: "hour", ms: 60 * 60 * 1000 },
            { name: "minute", ms: 60 * 1000 },
            { name: "second", ms: 1000 },
          ];

          for (const unit of units) {
            const value = Math.floor(diff / unit.ms);
            if (value >= 1) {
              const plural = value > 1 ? "s" : "";
              return `${value} ${unit.name}${plural}`;
            }
          }

          return "now";
        }
      },

      diff: class extends TimeMethodBuilder {
        override call() {
          const [date1, date2, unit = "milliseconds"] = this.args;
          this.validateDate(date1, "date1");
          this.validateDate(date2, "date2");
          this.validateString(unit, "unit");

          const diff = date1.getTime() - date2.getTime();

          switch (unit.toLowerCase()) {
            case "milliseconds":
            case "ms":
              return diff;
            case "seconds":
            case "s":
              return diff / 1000;
            case "minutes":
            case "m":
              return diff / (1000 * 60);
            case "hours":
            case "h":
              return diff / (1000 * 60 * 60);
            case "days":
            case "d":
              return diff / (1000 * 60 * 60 * 24);
            case "weeks":
            case "w":
              return diff / (1000 * 60 * 60 * 24 * 7);
            case "months":
              return (
                (date1.getFullYear() - date2.getFullYear()) * 12 +
                (date1.getMonth() - date2.getMonth())
              );
            case "years":
            case "y":
              return date1.getFullYear() - date2.getFullYear();
            default:
              throw this.throwErrorFormatters(new Error(`Invalid unit: ${unit}`));
          }
        }
      },

      isValid: class extends TimeMethodBuilder {
        override call() {
          const [date] = this.args;
          return date instanceof Date && !isNaN(date.getTime());
        }
      },

      isSame: class extends TimeMethodBuilder {
        override call() {
          const [date1, date2, granularity = "millisecond"] = this.args;
          this.validateDate(date1, "date1");
          this.validateDate(date2, "date2");

          switch (granularity.toLowerCase()) {
            case "year":
              return date1.getFullYear() === date2.getFullYear();
            case "month":
              return (
                date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth()
              );
            case "day":
              return date1.toDateString() === date2.toDateString();
            case "hour":
              return (
                Math.floor(date1.getTime() / (1000 * 60 * 60)) ===
                Math.floor(date2.getTime() / (1000 * 60 * 60))
              );
            case "minute":
              return (
                Math.floor(date1.getTime() / (1000 * 60)) ===
                Math.floor(date2.getTime() / (1000 * 60))
              );
            case "second":
              return Math.floor(date1.getTime() / 1000) === Math.floor(date2.getTime() / 1000);
            case "millisecond":
            default:
              return date1.getTime() === date2.getTime();
          }
        }
      },

      startOf: class extends TimeMethodBuilder {
        override call() {
          const [date, unit] = this.args;
          this.validateDate(date, "date");
          this.validateString(unit, "unit");

          const result = new Date(date.getTime());

          switch (unit.toLowerCase()) {
            case "year":
              result.setMonth(0, 1);
              result.setHours(0, 0, 0, 0);
              break;
            case "month":
              result.setDate(1);
              result.setHours(0, 0, 0, 0);
              break;
            case "week":
              const day = result.getDay();
              const diff = result.getDate() - day + (day === 0 ? -6 : 1);
              result.setDate(diff);
              result.setHours(0, 0, 0, 0);
              break;
            case "day":
              result.setHours(0, 0, 0, 0);
              break;
            case "hour":
              result.setMinutes(0, 0, 0);
              break;
            case "minute":
              result.setSeconds(0, 0);
              break;
            case "second":
              result.setMilliseconds(0);
              break;
            default:
              throw this.throwErrorFormatters(new Error(`Invalid unit: ${unit}`));
          }

          return result;
        }
      },

      endOf: class extends TimeMethodBuilder {
        override call() {
          const [date, unit] = this.args;
          this.validateDate(date, "date");
          this.validateString(unit, "unit");

          const result = new Date(date.getTime());

          switch (unit.toLowerCase()) {
            case "year":
              result.setMonth(11, 31);
              result.setHours(23, 59, 59, 999);
              break;
            case "month":
              result.setMonth(result.getMonth() + 1, 0);
              result.setHours(23, 59, 59, 999);
              break;
            case "week":
              const day = result.getDay();
              const diff = result.getDate() - day + (day === 0 ? 0 : 7);
              result.setDate(diff);
              result.setHours(23, 59, 59, 999);
              break;
            case "day":
              result.setHours(23, 59, 59, 999);
              break;
            case "hour":
              result.setMinutes(59, 59, 999);
              break;
            case "minute":
              result.setSeconds(59, 999);
              break;
            case "second":
              result.setMilliseconds(999);
              break;
            default:
              throw this.throwErrorFormatters(new Error(`Invalid unit: ${unit}`));
          }

          return result;
        }
      },

      measure: class extends TimeMethodBuilder {
        override async call() {
          const [callback, label] = this.args;
          this.validateFunction(callback, "callback");

          const labelStr = label || "execution";
          const start = performance.now();

          try {
            const result = await this.executeCallback(callback, []);
            const end = performance.now();
            const duration = end - start;

            return {
              result,
              duration,
              label: labelStr,
              start,
              end,
            };
          } catch (error: any) {
            const end = performance.now();
            const duration = end - start;

            throw this.throwErrorFormatters(error, {
              duration,
              label: labelStr,
              start,
              end,
            });
          }
        }
      },

      convert: class extends TimeMethodBuilder {
        override call() {
          const [value, fromUnit, toUnit] = this.args;
          this.validateNumber(value, "value");
          this.validateString(fromUnit, "fromUnit");
          this.validateString(toUnit, "toUnit");

          const msConversions: { [key: string]: number } = {
            milliseconds: 1,
            ms: 1,
            seconds: 1000,
            s: 1000,
            minutes: 60 * 1000,
            m: 60 * 1000,
            hours: 60 * 60 * 1000,
            h: 60 * 60 * 1000,
            days: 24 * 60 * 60 * 1000,
            d: 24 * 60 * 60 * 1000,
            weeks: 7 * 24 * 60 * 60 * 1000,
            w: 7 * 24 * 60 * 60 * 1000,
          };

          const fromMs = msConversions[fromUnit.toLowerCase()];
          const toMs = msConversions[toUnit.toLowerCase()];

          if (fromMs === undefined) {
            throw this.throwErrorFormatters(new Error(`Invalid from unit: ${fromUnit}`));
          }
          if (toMs === undefined) {
            throw this.throwErrorFormatters(new Error(`Invalid to unit: ${toUnit}`));
          }

          return (value * fromMs) / toMs;
        }
      },

      [Environment.SymbolFormatedText]: `TimeUtils { utilities }`,
    };
  }
}

export { TimeUtils };
