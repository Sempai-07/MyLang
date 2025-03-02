"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Interval = Interval;
const node_timers_1 = require("node:timers");
const utils_1 = require("../../utils");
const BaseError_1 = require("../../../errors/BaseError");
const triggerId = Symbol("TriggerId");
const triggerData = Symbol("TriggerData");
function getIntervalOrThrow(intervals, intervalId) {
    const interval = intervals.get(intervalId);
    if (!interval || intervalId !== interval[triggerId]) {
        throw new BaseError_1.BaseError(`Interval ID "${intervalId}" not found.`, {
            files: [`mylang:timers (${__filename})`],
        });
    }
    return interval;
}
function IntervalInfo(options) {
    return {
        intervalId: options.intervalId,
        idleTimeout: options.idleTimeout,
        onInterval: options.onInterval,
        timerArgs: options.timerArgs,
        stop() {
            const interval = getIntervalOrThrow(options.intervals, options.intervalId);
            (0, node_timers_1.clearInterval)(interval[triggerData]);
            options.intervals.delete(options.intervalId);
        },
        ref() {
            const interval = getIntervalOrThrow(options.intervals, options.intervalId);
            interval[triggerData].ref();
        },
        unref() {
            const interval = getIntervalOrThrow(options.intervals, options.intervalId);
            interval[triggerData].unref();
        },
        [triggerId]: options.intervalId,
        [triggerData]: options.intervalData,
    };
}
function Interval() {
    const intervals = new Map();
    return {
        set([cb, delay, ...args]) {
            if (!(0, utils_1.isFunctionNode)(cb)) {
                throw new BaseError_1.FunctionCallError("Invalid callback. Must be a FunctionDeclaration or FunctionExpression.", [`mylang:timers (${__filename})`]);
            }
            if (typeof delay !== "number" || delay <= 0) {
                throw new BaseError_1.ArgumentsError(`Invalid delay: "${delay}". Must be a positive number.`, [`mylang:timers (${__filename})`]);
            }
            const intervalData = (0, node_timers_1.setInterval)(() => cb.evaluate(cb.parentEnv).call(args.map((value) => ({ value }))), delay);
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
            return intervals.get(intervalId);
        },
        has([id]) {
            return intervals.has(id);
        },
        clear([id]) {
            const interval = getIntervalOrThrow(intervals, id);
            (0, node_timers_1.clearInterval)(interval[triggerData]);
            intervals.delete(id);
        },
        ref([id]) {
            const interval = getIntervalOrThrow(intervals, id);
            interval[triggerData].ref();
        },
        unref([id]) {
            const interval = getIntervalOrThrow(intervals, id);
            interval[triggerData].unref();
        },
        clearAll() {
            for (const id of intervals.keys()) {
                const interval = intervals.get(id);
                if (interval) {
                    (0, node_timers_1.clearInterval)(interval[triggerData]);
                }
            }
            intervals.clear();
        },
    };
}
