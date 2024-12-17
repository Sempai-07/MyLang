import { EventEmitter } from "node:events";
import { isFunctionNode } from "../../utils";
import { type FunctionDeclaration } from "../../../ast/declaration/FunctionDeclaration";
import { type FunctionExpression } from "../../../ast/expression/FunctionExpression";

function Emmiter() {
  const events = new EventEmitter();
  const eventsTarget = new Map();

  return {
    on([event, cb]: [string, FunctionDeclaration | FunctionExpression]): void {
      if (typeof event !== "string" || event.trim() === "") {
        throw `Invalid event name: "${event}". Must be a non-empty string.`;
      }

      if (!isFunctionNode(cb)) {
        throw "Invalid callback. Must be a FunctionDeclaration or FunctionExpression.";
      }

      const eventHandler = (args: any[]) =>
        cb.evaluate(cb.parentEnv).call(args);
      eventsTarget.set(cb.id, eventHandler);
      events.on(event, eventHandler);
    },
    once([event, cb]: [
      string,
      FunctionDeclaration | FunctionExpression,
    ]): void {
      if (typeof event !== "string" || event.trim() === "") {
        throw `Invalid event name: "${event}". Must be a non-empty string.`;
      }
      if (!isFunctionNode(cb)) {
        throw "Invalid callback. Must be a FunctionDeclaration or FunctionExpression.";
      }

      const eventHandler = (args: any[]) =>
        cb.evaluate(cb.parentEnv).call(args);
      eventsTarget.set(cb.id, eventHandler);
      events.once(event, eventHandler);
    },
    off([event, cb]: [string, FunctionDeclaration | FunctionExpression]): void {
      if (typeof event !== "string" || event.trim() === "") {
        throw `Invalid event name: "${event}". Must be a non-empty string.`;
      }
      if (!isFunctionNode(cb)) {
        throw "Invalid callback. Must be a FunctionDeclaration or FunctionExpression.";
      }

      const handler = eventsTarget.get(cb.id);
      if (!handler) {
        throw `Handler for callback ID "${cb.id}" not found.`;
      }

      events.off(event, handler);
      eventsTarget.delete(cb.id);
    },
    emit([event, ...args]: [string, ...any]): void {
      if (typeof event !== "string" || event.trim() === "") {
        throw `Invalid event name: "${event}". Must be a non-empty string.`;
      }

      if (!events.eventNames().includes(event)) {
        throw `Event "${event}" does not exist.`;
      }

      events.emit(event, args);
    },
    removeAllListeners([event]: [string | undefined]): void {
      if (
        event !== undefined &&
        (typeof event !== "string" || event.trim() === "")
      ) {
        throw `Invalid event name: "${event}". Must be a non-empty string.`;
      }
      events.removeAllListeners(event);
    },
    listenerCount([event]: [string]): number {
      if (typeof event !== "string" || event.trim() === "") {
        throw `Invalid event name: "${event}". Must be a non-empty string.`;
      }
      return events.listenerCount(event);
    },
    setMaxListeners([n]: [number]): void {
      if (typeof n !== "number" || n < 0) {
        throw `Invalid max listeners value: "${n}". Must be a non-negative number.`;
      }
      events.setMaxListeners(n);
    },
  };
}

export { Emmiter };
