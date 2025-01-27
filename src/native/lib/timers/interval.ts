import { setInterval, clearInterval } from "node:timers";
import { isFunctionNode } from "../../utils";
import { type FunctionDeclaration } from "../../../ast/declaration/FunctionDeclaration";
import { type FunctionExpression } from "../../../ast/expression/FunctionExpression";
import {
  BaseError,
  ArgumentsError,
  FunctionCallError,
} from "../../../errors/BaseError";

const triggerId = Symbol("TriggerId");
const triggerData = Symbol("TriggerData");

interface IntervalInfoType {
  intervalId: number;
  idleTimeout: number;
  onInterval: FunctionDeclaration | FunctionExpression;
  timerArgs: any[];
  stop(): void;
  ref(): void;
  unref(): void;
  [triggerId]: number;
  [triggerData]: NodeJS.Timeout;
}

interface IntervalType {
  set([cb, delay, args]: [
    FunctionDeclaration | FunctionExpression,
    number,
    any[],
  ]): IntervalInfoType;
  has([id]: [number]): boolean;
  clear([id]: [number]): void;
  ref([id]: [number]): void;
  unref([id]: [number]): void;
  clearAll(): void;
}

function getIntervalOrThrow(
  intervals: Map<number, IntervalInfoType>,
  intervalId: number,
) {
  const interval = intervals.get(intervalId);
  if (!interval || intervalId !== interval[triggerId]) {
    throw new BaseError(`Interval ID "${intervalId}" not found.`, {
      files: [`mylang:timers (${__filename})`],
    });
  }
  return interval;
}

function IntervalInfo(options: {
  intervalId: number;
  idleTimeout: number;
  onInterval: FunctionDeclaration | FunctionExpression;
  timerArgs: any[];
  intervalData: NodeJS.Timeout;
  intervals: Map<number, IntervalInfoType>;
}): IntervalInfoType {
  return {
    intervalId: options.intervalId,
    idleTimeout: options.idleTimeout,
    onInterval: options.onInterval,
    timerArgs: options.timerArgs,
    stop(): void {
      const interval = getIntervalOrThrow(
        options.intervals,
        options.intervalId,
      );
      clearInterval(interval[triggerData]);
      options.intervals.delete(options.intervalId);
    },
    ref(): void {
      const interval = getIntervalOrThrow(
        options.intervals,
        options.intervalId,
      );
      interval[triggerData].ref();
    },
    unref(): void {
      const interval = getIntervalOrThrow(
        options.intervals,
        options.intervalId,
      );
      interval[triggerData].unref();
    },
    [triggerId]: options.intervalId,
    [triggerData]: options.intervalData,
  };
}

function Interval(): IntervalType {
  const intervals = new Map<number, IntervalInfoType>();

  return {
    set([cb, delay, ...args]: [
      FunctionDeclaration | FunctionExpression,
      number,
      any[],
    ]) {
      if (!isFunctionNode(cb)) {
        throw new FunctionCallError(
          "Invalid callback. Must be a FunctionDeclaration or FunctionExpression.",
          [`mylang:timers (${__filename})`],
        );
      }
      if (typeof delay !== "number" || delay <= 0) {
        throw new ArgumentsError(
          `Invalid delay: "${delay}". Must be a positive number.`,
          [`mylang:timers (${__filename})`],
        );
      }

      const intervalData = setInterval(
        () => cb.evaluate(cb.parentEnv).call(args),
        delay,
      );
      const intervalId = Number(intervalData);

      const info = IntervalInfo({
        intervalId,
        idleTimeout: delay,
        onInterval: cb,
        timerArgs: args,
        intervalData,
        intervals,
      });

      intervals.set(intervalId, info);

      return intervals.get(intervalId)!;
    },
    has([id]: [number]) {
      return intervals.has(id);
    },
    clear([id]: [number]) {
      const interval = getIntervalOrThrow(intervals, id);
      clearInterval(interval[triggerData]);
      intervals.delete(id);
    },
    ref([id]: [number]) {
      const interval = getIntervalOrThrow(intervals, id);
      interval[triggerData].ref();
    },
    unref([id]: [number]) {
      const interval = getIntervalOrThrow(intervals, id);
      interval[triggerData].unref();
    },
    clearAll() {
      for (const id of intervals.keys()) {
        const interval = intervals.get(id);
        if (interval) {
          clearInterval(interval[triggerData]);
        }
      }
      intervals.clear();
    },
  };
}

export { Interval };
