import { TimeMethodBuilder } from "./TimeBuilder";
import { Environment } from "../../src/Environment";

class TimeZone extends TimeMethodBuilder {
  override call() {
    const [timezone = Intl.DateTimeFormat().resolvedOptions().timeZone] = this.args;
    this.validateString(timezone, "timezone");

    try {
      Intl.DateTimeFormat("en", { timeZone: timezone });
    } catch (error) {
      throw this.throwErrorFormatters(new Error(`Invalid timezone: ${timezone}`));
    }

    const calculateOffset = (date = new Date()) => {
      const formatter = new Intl.DateTimeFormat("en", {
        timeZone: timezone,
        timeZoneName: "longOffset",
      });

      try {
        const parts = formatter.formatToParts(date);
        const offsetPart = parts.find((part) => part.type === "timeZoneName");

        if (offsetPart && offsetPart.value.match(/^GMT[+-]\d{1,2}:\d{2}$/)) {
          const match = offsetPart.value.match(/GMT([+-])(\d{1,2}):(\d{2})/);
          if (match) {
            const sign = match[1] === "+" ? 1 : -1;
            const hours = parseInt(match[2]!);
            const minutes = parseInt(match[3]!);
            return sign * (hours * 60 + minutes);
          }
        }
      } catch (error) {}

      const utcTime = new Date(date.toISOString());
      const localTime = new Date(
        date.toLocaleString("sv-SE", {
          timeZone: timezone,
        }) + "Z",
      );

      const diffMs = localTime.getTime() - utcTime.getTime();
      return Math.round(diffMs / (1000 * 60));
    };

    const offsetMethod = class extends TimeMethodBuilder {
      override call() {
        const [date = new Date()] = this.args;
        return calculateOffset(date);
      }
    };

    return {
      name: class extends TimeMethodBuilder {
        override call() {
          return timezone;
        }
      },

      offset: offsetMethod,

      offsetHours: class extends TimeMethodBuilder {
        override call() {
          const [date = new Date()] = this.args;
          const offsetMinutes = calculateOffset(date);
          return offsetMinutes / 60;
        }
      },

      offsetString: class extends TimeMethodBuilder {
        override call() {
          const [date = new Date()] = this.args;
          const offsetMinutes = Math.round(calculateOffset(date));
          const hours = Math.floor(Math.abs(offsetMinutes) / 60);
          const minutes = Math.abs(offsetMinutes) % 60;
          const sign = offsetMinutes >= 0 ? "+" : "-";
          const pad = (num: number) => num.toString().padStart(2, "0");
          return `${sign}${pad(hours)}:${pad(minutes)}`;
        }
      },

      isDST: class extends TimeMethodBuilder {
        override call() {
          const [date = new Date()] = this.args;
          const january = new Date(date.getFullYear(), 0, 1);
          const july = new Date(date.getFullYear(), 6, 1);

          const janOffset = calculateOffset(january);
          const julOffset = calculateOffset(july);
          const currentOffset = calculateOffset(date);

          return currentOffset > Math.min(janOffset, julOffset);
        }
      },

      convert: class extends TimeMethodBuilder {
        override call() {
          const [date, toTimezone] = this.args;
          this.validateDate(date, "date");
          this.validateString(toTimezone, "toTimezone");

          try {
            Intl.DateTimeFormat("en", { timeZone: toTimezone });
          } catch (error) {
            throw this.throwErrorFormatters(new Error(`Invalid target timezone: ${toTimezone}`));
          }

          const fromString = date.toLocaleString("sv-SE", { timeZone: timezone });
          const toDate = new Date(fromString + "Z");

          return new Date(toDate.toLocaleString("sv-SE", { timeZone: toTimezone }));
        }
      },

      format: class extends TimeMethodBuilder {
        override call() {
          const [date = new Date(), options = {}] = this.args;
          this.validateDate(date, "date");

          const defaultOptions = {
            timeZone: timezone,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            ...options,
          };

          return date.toLocaleString("en-US", defaultOptions);
        }
      },

      now: class extends TimeMethodBuilder {
        override call() {
          const now = new Date();
          const utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
          const target = new Date(utc.toLocaleString("en-US", { timeZone: timezone }));
          return target;
        }
      },

      abbreviation: class extends TimeMethodBuilder {
        override call() {
          const [date = new Date()] = this.args;
          const formatter = new Intl.DateTimeFormat("en", {
            timeZone: timezone,
            timeZoneName: "short",
          });

          const parts = formatter.formatToParts(date);
          const timeZoneName = parts.find((part) => part.type === "timeZoneName");
          return timeZoneName ? timeZoneName.value : timezone;
        }
      },

      longName: class extends TimeMethodBuilder {
        override call() {
          const [date = new Date()] = this.args;
          const formatter = new Intl.DateTimeFormat("en", {
            timeZone: timezone,
            timeZoneName: "long",
          });

          const parts = formatter.formatToParts(date);
          const timeZoneName = parts.find((part) => part.type === "timeZoneName");
          return timeZoneName ? timeZoneName.value : timezone;
        }
      },

      isValid: class extends TimeMethodBuilder {
        override call() {
          try {
            Intl.DateTimeFormat("en", { timeZone: timezone });
            return true;
          } catch {
            return false;
          }
        }
      },

      compare: class extends TimeMethodBuilder {
        override call() {
          const [otherTimezone, date = new Date()] = this.args;
          this.validateString(otherTimezone, "otherTimezone");

          const offset1 = calculateOffset(date);
          const tz2 = new TimeZone([otherTimezone], [], this.environment).call();
          const offset2 = new tz2.offset([date], [], this.environment).call();

          return {
            difference: offset1 - offset2,
            differenceHours: (offset1 - offset2) / 60,
            ahead: offset1 > offset2,
            behind: offset1 < offset2,
            same: offset1 === offset2,
          };
        }
      },

      [Environment.SymbolFormatedText]: `TimeZone { ${timezone} }`,
    };
  }
}

class TimeZones extends TimeMethodBuilder {
  override call() {
    const commonTimezones: Record<string, string> = {
      UTC: "UTC",
      GMT: "GMT",
      EST: "America/New_York",
      PST: "America/Los_Angeles",
      CST: "America/Chicago",
      MST: "America/Denver",
      JST: "Asia/Tokyo",
      CET: "Europe/Berlin",
      IST: "Asia/Kolkata",
      AEST: "Australia/Sydney",
      BST: "Europe/London",
      MSK: "Europe/Moscow",
    };

    return {
      list: class extends TimeMethodBuilder {
        override call() {
          return Intl.supportedValuesOf("timeZone");
        }
      },

      common: class extends TimeMethodBuilder {
        override call() {
          return commonTimezones;
        }
      },

      get: class extends TimeMethodBuilder {
        override call() {
          const [name] = this.args;
          this.validateString(name, "name");

          const timezone =
            commonTimezones[name.toUpperCase() as keyof typeof commonTimezones] || name;
          return new TimeZone([timezone], [], this.environment).call();
        }
      },

      local: class extends TimeMethodBuilder {
        override call() {
          const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          return new TimeZone([timezone], [], this.environment).call();
        }
      },

      utc: class extends TimeMethodBuilder {
        override call() {
          return new TimeZone(["UTC"], [], this.environment).call();
        }
      },

      findByOffset: class extends TimeMethodBuilder {
        override call() {
          const [offsetHours, date = new Date()] = this.args;
          this.validateNumber(offsetHours, "offsetHours");

          const targetOffsetMinutes = offsetHours * 60;
          const allTimezones = Intl.supportedValuesOf("timeZone");
          const matching = [];

          for (const tz of allTimezones) {
            try {
              const tzObj = new TimeZone([tz], [], this.environment).call();
              const offset = new tzObj.offset([date], [], this.environment).call();
              if (Math.abs(offset - targetOffsetMinutes) < 1) {
                matching.push(tz);
              }
            } catch {}
          }

          return matching;
        }
      },

      [Environment.SymbolFormatedText]: `TimeZones { ${Object.keys(commonTimezones).length} common zones }`,
    };
  }
}

export { TimeZone, TimeZones };
