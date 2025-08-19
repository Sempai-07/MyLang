import { TimeMethodBuilder } from "./TimeBuilder";
import { DateTime } from "./DateTime";
import { Duration } from "./Duration";
import { Stopwatch } from "./Stopwatch";
import { Sleep, Delay, Debounce, Throttle, Interval, Timeout } from "./Sleep";
import { TimeZone, TimeZones } from "./TimeZone";
import { TimeUtils } from "./TimeUtils";

module.exports = {
  DateTime,
  Duration,
  Stopwatch,

  Sleep,
  Delay,
  Debounce,
  Throttle,
  Interval,
  Timeout,

  TimeZone,
  TimeZones,

  TimeUtils,

  now: class extends TimeMethodBuilder {
    override call() {
      const utils = new TimeUtils([], [], this.environment).call();
      return new utils.now([], [], this.environment).call();
    }
  },
};
