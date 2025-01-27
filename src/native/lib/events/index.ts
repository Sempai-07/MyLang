import { EventEmitter } from "node:events";
import { isFunctionNode } from "../../utils";
import { type FunctionDeclaration } from "../../../ast/declaration/FunctionDeclaration";
import { type FunctionExpression } from "../../../ast/expression/FunctionExpression";
import {
  BaseError,
  ArgumentsError,
  FunctionCallError,
} from "../../../errors/BaseError";

function Emmiter() {
  const events = new EventEmitter();
  const eventsTarget = new Map();

  return {
    on([event, cb]: [string, FunctionDeclaration | FunctionExpression]): void {
      if (typeof event !== "string" || event.trim() === "") {
        throw new ArgumentsError(`Must be a non-empty string.`, [
          `mylang:events (${__filename})`,
        ]);
      }

      if (!isFunctionNode(cb)) {
        throw new FunctionCallError(
          "Invalid callback. Must be a FunctionDeclaration or FunctionExpression.",
          [`mylang:events (${__filename})`],
        );
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
        throw new ArgumentsError(`Must be a non-empty string.`, [
          `mylang:events (${__filename})`,
        ]);
      }
      if (!isFunctionNode(cb)) {
        throw new FunctionCallError(
          "Invalid callback. Must be a FunctionDeclaration or FunctionExpression.",
          [`mylang:events (${__filename})`],
        );
      }

      const eventHandler = (args: any[]) =>
        cb.evaluate(cb.parentEnv).call(args);
      eventsTarget.set(cb.id, eventHandler);
      events.once(event, eventHandler);
    },
    off([event, cb]: [string, FunctionDeclaration | FunctionExpression]): void {
      if (typeof event !== "string" || event.trim() === "") {
        throw new ArgumentsError(`Must be a non-empty string.`, [
          `mylang:events (${__filename})`,
        ]);
      }
      if (!isFunctionNode(cb)) {
        throw new FunctionCallError(
          "Invalid callback. Must be a FunctionDeclaration or FunctionExpression.",
          [`mylang:events (${__filename})`],
        );
      }

      const handler = eventsTarget.get(cb.id);
      if (!handler) {
        throw new BaseError(`Handler for callback ID "${cb.id}" not found.`, {
          files: [`mylang:events (${__filename})`],
        });
      }

      events.off(event, handler);
      eventsTarget.delete(cb.id);
    },
    emit([event, ...args]: [string, ...any]): void {
      if (typeof event !== "string" || event.trim() === "") {
        throw new ArgumentsError(`Must be a non-empty string.`, [
          `mylang:events (${__filename})`,
        ]);
      }

      if (!events.eventNames().includes(event)) {
        throw new BaseError(`Event "${event}" does not exist.`, {
          files: [`mylang:events (${__filename})`],
        });
      }

      events.emit(event, args);
    },
    removeAllListeners([event]: [string | undefined]): void {
      if (
        event !== undefined &&
        (typeof event !== "string" || event.trim() === "")
      ) {
        throw new ArgumentsError(`Must be a non-empty string.`, [
          `mylang:events (${__filename})`,
        ]);
      }
      events.removeAllListeners(event);
    },
    listenerCount([event]: [string]): number {
      if (typeof event !== "string" || event.trim() === "") {
        throw new ArgumentsError(`Must be a non-empty string.`, [
          `mylang:events (${__filename})`,
        ]);
      }
      return events.listenerCount(event);
    },
    setMaxListeners([n]: [number]): void {
      if (typeof n !== "number" || n < 0) {
        throw new ArgumentsError(`Must be a non-negative number.`, [
          `mylang:events (${__filename})`,
        ]);
      }
      events.setMaxListeners(n);
    },
  };
}

export { Emmiter };
