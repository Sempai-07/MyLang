import { TimeMethodBuilder } from "./TimeBuilder";
import { Environment } from "../../src/Environment";

class DateTime extends TimeMethodBuilder {
  override call() {
    const [year, month, day, hour = 0, minute = 0, second = 0, millisecond = 0] = this.args;

    let date: Date;

    if (year === undefined || year === null) {
      date = new Date();
    } else if (typeof year === "string") {
      date = new Date(year);
    } else if (year instanceof Date) {
      date = new Date(year.getTime());
    } else if (year?.[Environment.SymbolTime]) {
      date = year[Environment.SymbolTime];
    } else {
      date = new Date(year, (month || 1) - 1, day || 1, hour, minute, second, millisecond);
    }

    if (isNaN(date.getTime())) {
      throw this.throwErrorFormatters(new Error("Invalid date"));
    }

    return {
      year: class extends TimeMethodBuilder {
        override call() {
          return date.getFullYear();
        }
      },

      month: class extends TimeMethodBuilder {
        override call() {
          return date.getMonth() + 1;
        }
      },

      day: class extends TimeMethodBuilder {
        override call() {
          return date.getDate();
        }
      },

      hour: class extends TimeMethodBuilder {
        override call() {
          return date.getHours();
        }
      },

      minute: class extends TimeMethodBuilder {
        override call() {
          return date.getMinutes();
        }
      },

      second: class extends TimeMethodBuilder {
        override call() {
          return date.getSeconds();
        }
      },

      millisecond: class extends TimeMethodBuilder {
        override call() {
          return date.getMilliseconds();
        }
      },

      weekday: class extends TimeMethodBuilder {
        override call() {
          return date.getDay();
        }
      },

      setYear: class extends TimeMethodBuilder {
        override call() {
          const [newYear] = this.args;
          this.validateNumber(newYear, "year");
          const newDate = new Date(date.getTime());
          newDate.setFullYear(newYear);
          return new DateTime([newDate], [], this.environment).call();
        }
      },

      setMonth: class extends TimeMethodBuilder {
        override call() {
          const [newMonth] = this.args;
          this.validateNumber(newMonth, "month");
          const newDate = new Date(date.getTime());
          newDate.setMonth(newMonth - 1);
          return new DateTime([newDate], [], this.environment).call();
        }
      },

      setDay: class extends TimeMethodBuilder {
        override call() {
          const [newDay] = this.args;
          this.validateNumber(newDay, "day");
          const newDate = new Date(date.getTime());
          newDate.setDate(newDay);
          return new DateTime([newDate], [], this.environment).call();
        }
      },

      setHour: class extends TimeMethodBuilder {
        override call() {
          const [newHour] = this.args;
          this.validateNumber(newHour, "hour");
          const newDate = new Date(date.getTime());
          newDate.setHours(newHour);
          return new DateTime([newDate], [], this.environment).call();
        }
      },

      setMinute: class extends TimeMethodBuilder {
        override call() {
          const [newMinute] = this.args;
          this.validateNumber(newMinute, "minute");
          const newDate = new Date(date.getTime());
          newDate.setMinutes(newMinute);
          return new DateTime([newDate], [], this.environment).call();
        }
      },

      setSecond: class extends TimeMethodBuilder {
        override call() {
          const [newSecond] = this.args;
          this.validateNumber(newSecond, "second");
          const newDate = new Date(date.getTime());
          newDate.setSeconds(newSecond);
          return new DateTime([newDate], [], this.environment).call();
        }
      },

      addYears: class extends TimeMethodBuilder {
        override call() {
          const [years] = this.args;
          this.validateNumber(years, "years");
          const newDate = new Date(date.getTime());
          newDate.setFullYear(newDate.getFullYear() + years);
          return new DateTime([newDate], [], this.environment).call();
        }
      },

      addMonths: class extends TimeMethodBuilder {
        override call() {
          const [months] = this.args;
          this.validateNumber(months, "months");
          const newDate = new Date(date.getTime());
          newDate.setMonth(newDate.getMonth() + months);
          return new DateTime([newDate], [], this.environment).call();
        }
      },

      addDays: class extends TimeMethodBuilder {
        override call() {
          const [days] = this.args;
          this.validateNumber(days, "days");
          const newDate = new Date(date.getTime());
          newDate.setDate(newDate.getDate() + days);
          return new DateTime([newDate], [], this.environment).call();
        }
      },

      addHours: class extends TimeMethodBuilder {
        override call() {
          const [hours] = this.args;
          this.validateNumber(hours, "hours");
          const newDate = new Date(date.getTime() + hours * 60 * 60 * 1000);
          return new DateTime([newDate], [], this.environment).call();
        }
      },

      addMinutes: class extends TimeMethodBuilder {
        override call() {
          const [minutes] = this.args;
          this.validateNumber(minutes, "minutes");
          const newDate = new Date(date.getTime() + minutes * 60 * 1000);
          return new DateTime([newDate], [], this.environment).call();
        }
      },

      addSeconds: class extends TimeMethodBuilder {
        override call() {
          const [seconds] = this.args;
          this.validateNumber(seconds, "seconds");
          const newDate = new Date(date.getTime() + seconds * 1000);
          return new DateTime([newDate], [], this.environment).call();
        }
      },

      isBefore: class extends TimeMethodBuilder {
        override call() {
          const [other] = this.args;
          this.validateDate(other, "other");
          return date.getTime() < other.getTime();
        }
      },

      isAfter: class extends TimeMethodBuilder {
        override call() {
          const [other] = this.args;
          this.validateDate(other, "other");
          return date.getTime() > other.getTime();
        }
      },

      isEqual: class extends TimeMethodBuilder {
        override call() {
          const [other] = this.args;
          this.validateDate(other, "other");
          return date.getTime() === other.getTime();
        }
      },

      format: class extends TimeMethodBuilder {
        override call() {
          const [formatStr = "YYYY-MM-DD HH:mm:ss"] = this.args;
          this.validateString(formatStr, "format");

          const pad = (num: number, length = 2) => num.toString().padStart(length, "0");

          return formatStr
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

      toISOString: class extends TimeMethodBuilder {
        override call() {
          return date.toISOString();
        }
      },

      toTimestamp: class extends TimeMethodBuilder {
        override call() {
          return Math.floor(date.getTime() / 1000);
        }
      },

      toMilliseconds: class extends TimeMethodBuilder {
        override call() {
          return date.getTime();
        }
      },

      startOfDay: class extends TimeMethodBuilder {
        override call() {
          const newDate = new Date(date.getTime());
          newDate.setHours(0, 0, 0, 0);
          return new DateTime([newDate], [], this.environment).call();
        }
      },

      endOfDay: class extends TimeMethodBuilder {
        override call() {
          const newDate = new Date(date.getTime());
          newDate.setHours(23, 59, 59, 999);
          return new DateTime([newDate], [], this.environment).call();
        }
      },

      startOfWeek: class extends TimeMethodBuilder {
        override call() {
          const [startDay = 1] = this.args;
          const newDate = new Date(date.getTime());
          const day = newDate.getDay();
          const diff = (day < startDay ? 7 : 0) + day - startDay;
          newDate.setDate(newDate.getDate() - diff);
          newDate.setHours(0, 0, 0, 0);
          return new DateTime([newDate], [], this.environment).call();
        }
      },

      startOfMonth: class extends TimeMethodBuilder {
        override call() {
          const newDate = new Date(date.getTime());
          newDate.setDate(1);
          newDate.setHours(0, 0, 0, 0);
          return new DateTime([newDate], [], this.environment).call();
        }
      },

      startOfYear: class extends TimeMethodBuilder {
        override call() {
          const newDate = new Date(date.getTime());
          newDate.setMonth(0, 1);
          newDate.setHours(0, 0, 0, 0);
          return new DateTime([newDate], [], this.environment).call();
        }
      },

      isLeapYear: class extends TimeMethodBuilder {
        override call() {
          const year = date.getFullYear();
          return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
        }
      },

      isWeekend: class extends TimeMethodBuilder {
        override call() {
          const day = date.getDay();
          return day === 0 || day === 6;
        }
      },

      isWeekday: class extends TimeMethodBuilder {
        override call() {
          const day = date.getDay();
          return day >= 1 && day <= 5;
        }
      },

      clone: class extends TimeMethodBuilder {
        override call() {
          return new DateTime([new Date(date.getTime())], [], this.environment).call();
        }
      },

      [Environment.SymbolTime]: new Date(date.getTime()),

      [Environment.SymbolFormatedText]: `DateTime { ${date.toISOString()} }`,
    };
  }
}

export { DateTime };
