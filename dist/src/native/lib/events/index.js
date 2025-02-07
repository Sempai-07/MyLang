"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Emmiter = Emmiter;
const node_events_1 = require("node:events");
const utils_1 = require("../../utils");
const BaseError_1 = require("../../../errors/BaseError");
function Emmiter() {
    const events = new node_events_1.EventEmitter();
    const eventsTarget = new Map();
    return {
        on([event, cb]) {
            if (typeof event !== "string" || event.trim() === "") {
                throw new BaseError_1.ArgumentsError(`Must be a non-empty string.`, [
                    `mylang:events (${__filename})`,
                ]);
            }
            if (!(0, utils_1.isFunctionNode)(cb)) {
                throw new BaseError_1.FunctionCallError("Invalid callback. Must be a FunctionDeclaration or FunctionExpression.", [`mylang:events (${__filename})`]);
            }
            const eventHandler = (args) => cb.evaluate(cb.parentEnv).call(args);
            eventsTarget.set(cb.id, eventHandler);
            events.on(event, eventHandler);
        },
        once([event, cb]) {
            if (typeof event !== "string" || event.trim() === "") {
                throw new BaseError_1.ArgumentsError(`Must be a non-empty string.`, [
                    `mylang:events (${__filename})`,
                ]);
            }
            if (!(0, utils_1.isFunctionNode)(cb)) {
                throw new BaseError_1.FunctionCallError("Invalid callback. Must be a FunctionDeclaration or FunctionExpression.", [`mylang:events (${__filename})`]);
            }
            const eventHandler = (args) => cb.evaluate(cb.parentEnv).call(args);
            eventsTarget.set(cb.id, eventHandler);
            events.once(event, eventHandler);
        },
        off([event, cb]) {
            if (typeof event !== "string" || event.trim() === "") {
                throw new BaseError_1.ArgumentsError(`Must be a non-empty string.`, [
                    `mylang:events (${__filename})`,
                ]);
            }
            if (!(0, utils_1.isFunctionNode)(cb)) {
                throw new BaseError_1.FunctionCallError("Invalid callback. Must be a FunctionDeclaration or FunctionExpression.", [`mylang:events (${__filename})`]);
            }
            const handler = eventsTarget.get(cb.id);
            if (!handler) {
                throw new BaseError_1.BaseError(`Handler for callback ID "${cb.id}" not found.`, {
                    files: [`mylang:events (${__filename})`],
                });
            }
            events.off(event, handler);
            eventsTarget.delete(cb.id);
        },
        emit([event, ...args]) {
            if (typeof event !== "string" || event.trim() === "") {
                throw new BaseError_1.ArgumentsError(`Must be a non-empty string.`, [
                    `mylang:events (${__filename})`,
                ]);
            }
            events.emit(event, args);
        },
        removeAllListeners([event]) {
            if (event !== undefined &&
                (typeof event !== "string" || event.trim() === "")) {
                throw new BaseError_1.ArgumentsError(`Must be a non-empty string.`, [
                    `mylang:events (${__filename})`,
                ]);
            }
            events.removeAllListeners(event);
        },
        listenerCount([event]) {
            if (typeof event !== "string" || event.trim() === "") {
                throw new BaseError_1.ArgumentsError(`Must be a non-empty string.`, [
                    `mylang:events (${__filename})`,
                ]);
            }
            return events.listenerCount(event);
        },
        setMaxListeners([n]) {
            if (typeof n !== "number" || n < 0) {
                throw new BaseError_1.ArgumentsError(`Must be a non-negative number.`, [
                    `mylang:events (${__filename})`,
                ]);
            }
            events.setMaxListeners(n);
        },
    };
}
