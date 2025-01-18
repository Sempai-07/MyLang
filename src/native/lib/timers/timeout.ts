import { setTimeout, clearTimeout } from "node:timers";
import { isFunctionNode } from "../../utils";
import { type FunctionDeclaration } from "../../../ast/declaration/FunctionDeclaration";
import { type FunctionExpression } from "../../../ast/expression/FunctionExpression";

const triggerId = Symbol("TriggerId");
const triggerData = Symbol("TriggerData");

interface TimeoutInfoType {
  timeoutId: number;
  idleTimeout: number;
  onTimeout: FunctionDeclaration | FunctionExpression;
  timerArgs: any[];
  stop(): void;
  ref(): void;
  unref(): void;
  [triggerId]: number;
  [triggerData]: NodeJS.Timeout;
}

interface TimeoutType {
  set([cb, delay, args]: [
    FunctionDeclaration | FunctionExpression,
    number,
    any[],
  ]): TimeoutInfoType;
  clear([id]: [number]): void;
  ref([id]: [number]): void;
  unref([id]: [number]): void;
  clearAll(): void;
}

function getTimeoutOrThrow(
  timeouts: Map<number, TimeoutInfoType>,
  timeoutId: number,
) {
  const timeout = timeouts.get(timeoutId);
  if (!timeout || timeoutId !== timeout[triggerId]) {
    throw `Timeout ID "${timeoutId}" not found.`;
  }
  return timeout;
}

function TimeoutInfo(options: {
  timeoutId: number;
  idleTimeout: number;
  onTimeout: FunctionDeclaration | FunctionExpression;
  timerArgs: any[];
  timeoutData: NodeJS.Timeout;
  timeouts: Map<number, TimeoutInfoType>;
}): TimeoutInfoType {
  return {
    timeoutId: options.timeoutId,
    idleTimeout: options.idleTimeout,
    onTimeout: options.onTimeout,
    timerArgs: options.timerArgs,
    stop(): void {
      const timeout = getTimeoutOrThrow(options.timeouts, options.timeoutId);
      clearTimeout(timeout[triggerData]);
      options.timeouts.delete(options.timeoutId);
    },
    ref(): void {
      const timeout = getTimeoutOrThrow(options.timeouts, options.timeoutId);
      timeout[triggerData].ref();
    },
    unref(): void {
      const timeout = getTimeoutOrThrow(options.timeouts, options.timeoutId);
      timeout[triggerData].unref();
    },
    [triggerId]: options.timeoutId,
    [triggerData]: options.timeoutData,
  };
}

function Timeout(): TimeoutType {
  const timeouts = new Map<number, TimeoutInfoType>();

  return {
    set([cb, delay, ...args]: [
      FunctionDeclaration | FunctionExpression,
      number,
      any[],
    ]) {
      if (!isFunctionNode(cb)) {
        throw "Invalid callback. Must be a FunctionDeclaration or FunctionExpression.";
      }
      if (typeof delay !== "number" || delay < 0) {
        throw `Invalid delay: "${delay}". Must be a non-negative number.`;
      }

      const timeoutData = setTimeout(
        () => cb.evaluate(cb.parentEnv).call(args),
        delay,
      );
      const timeoutId = Number(timeoutData);

      const info = TimeoutInfo({
        timeoutId,
        idleTimeout: delay,
        onTimeout: cb,
        timerArgs: args,
        timeoutData,
        timeouts,
      });

      timeouts.set(timeoutId, info);

      return timeouts.get(timeoutId)!;
    },
    clear([id]: [number]) {
      const timeout = getTimeoutOrThrow(timeouts, id);
      clearTimeout(timeout[triggerData]);
      timeouts.delete(id);
    },
    ref([id]: [number]) {
      const timeout = getTimeoutOrThrow(timeouts, id);
      timeout[triggerData].ref();
    },
    unref([id]: [number]) {
      const timeout = getTimeoutOrThrow(timeouts, id);
      timeout[triggerData].unref();
    },
    clearAll() {
      for (const id of timeouts.keys()) {
        const timeout = timeouts.get(id);
        if (timeout) {
          clearTimeout(timeout[triggerData]);
        }
      }
      timeouts.clear();
    },
  };
}

export { Timeout };
