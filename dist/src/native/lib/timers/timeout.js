"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Timeout = Timeout;
const node_timers_1 = require("node:timers");
const utils_1 = require("../../utils");
const BaseError_1 = require("../../../errors/BaseError");
const triggerId = Symbol("TriggerId");
const triggerData = Symbol("TriggerData");
function getTimeoutOrThrow(timeouts, timeoutId) {
    const timeout = timeouts.get(timeoutId);
    if (!timeout || timeoutId !== timeout[triggerId]) {
        throw new BaseError_1.BaseError(`Timeout ID "${timeoutId}" not found.`, {
            files: [`mylang:timers (${__filename})`],
        });
    }
    return timeout;
}
function TimeoutInfo(options) {
    return {
        timeoutId: options.timeoutId,
        idleTimeout: options.idleTimeout,
        onTimeout: options.onTimeout,
        timerArgs: options.timerArgs,
        stop() {
            const timeout = getTimeoutOrThrow(options.timeouts, options.timeoutId);
            (0, node_timers_1.clearTimeout)(timeout[triggerData]);
            options.timeouts.delete(options.timeoutId);
        },
        ref() {
            const timeout = getTimeoutOrThrow(options.timeouts, options.timeoutId);
            timeout[triggerData].ref();
        },
        unref() {
            const timeout = getTimeoutOrThrow(options.timeouts, options.timeoutId);
            timeout[triggerData].unref();
        },
        [triggerId]: options.timeoutId,
        [triggerData]: options.timeoutData,
    };
}
function Timeout() {
    const timeouts = new Map();
    return {
        set([cb, delay, ...args]) {
            if (!(0, utils_1.isFunctionNode)(cb)) {
                throw new BaseError_1.FunctionCallError("Invalid callback. Must be a FunctionDeclaration or FunctionExpression.", [`mylang:timers (${__filename})`]);
            }
            if (typeof delay !== "number" || delay < 0) {
                throw new BaseError_1.ArgumentsError(`Invalid delay: "${delay}". Must be a non-negative number.`, [`mylang:timers (${__filename})`]);
            }
            const timeoutData = (0, node_timers_1.setTimeout)(() => cb.evaluate(cb.parentEnv).call(args.map((value) => ({ value }))), delay);
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
            return timeouts.get(timeoutId);
        },
        clear([id]) {
            const timeout = getTimeoutOrThrow(timeouts, id);
            (0, node_timers_1.clearTimeout)(timeout[triggerData]);
            timeouts.delete(id);
        },
        ref([id]) {
            const timeout = getTimeoutOrThrow(timeouts, id);
            timeout[triggerData].ref();
        },
        unref([id]) {
            const timeout = getTimeoutOrThrow(timeouts, id);
            timeout[triggerData].unref();
        },
        clearAll() {
            for (const id of timeouts.keys()) {
                const timeout = timeouts.get(id);
                if (timeout) {
                    (0, node_timers_1.clearTimeout)(timeout[triggerData]);
                }
            }
            timeouts.clear();
        },
    };
}
