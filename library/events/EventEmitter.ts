import { EventMethodBuilder } from "./EventsBuilder";
import { Environment } from "../../src/Environment";
import { type FunctionBuilder } from "../FunctionBuilder";

interface IListeners {
  listener: typeof FunctionBuilder;
  once: boolean;
  prepend: boolean;
}

class EventEmitter extends EventMethodBuilder {
  override call() {
    const events = new Map<string, IListeners[]>();
    const maxListeners = { value: 10 };
    let captureRejections = false;

    return {
      on: class extends EventMethodBuilder {
        override call() {
          const [eventName, listener] = this.args;
          this.validateString(eventName);
          this.validateFunction(listener);

          if (!events.has(eventName)) {
            events.set(eventName, []);
          }

          const listeners = events.get(eventName)!;

          if (listeners.length >= maxListeners.value && maxListeners.value > 0) {
            console.warn(
              `Possible EventEmitter memory leak detected. ${listeners.length + 1} ${eventName} listeners added. Use setMaxListeners() to increase limit.`,
            );
          }

          listeners.push({ listener, once: false, prepend: false });
          return new EventEmitter([], [], this.environment).call();
        }
      },

      once: class extends EventMethodBuilder {
        override call() {
          const [eventName, listener] = this.args;
          this.validateString(eventName);
          this.validateFunction(listener);

          if (!events.has(eventName)) {
            events.set(eventName, []);
          }

          const listeners = events.get(eventName)!;
          listeners.push({ listener, once: true, prepend: false });
          return new EventEmitter([], [], this.environment).call();
        }
      },

      emit: class extends EventMethodBuilder {
        override async call() {
          const [eventName, ...args] = this.args;
          this.validateString(eventName);

          if (!events.has(eventName)) {
            return false;
          }

          const listeners = events.get(eventName)!;
          if (listeners.length === 0) {
            return false;
          }

          const listenersToRemove = [];

          for (let i = 0; i < listeners.length; i++) {
            const { listener, once } = listeners[i]!;

            try {
              await this.executeListener(listener, args);

              if (once) {
                listenersToRemove.push(i);
              }
            } catch (error) {
              if (captureRejections && events.has("error")) {
                await this.executeListener(events.get("error")![0]?.listener, [error]);
              } else {
                throw error;
              }
            }
          }

          for (let i = listenersToRemove.length - 1; i >= 0; i--) {
            listeners.splice(listenersToRemove[i]!, 1);
          }

          return true;
        }
      },

      off: class extends EventMethodBuilder {
        override call() {
          const [eventName, listener] = this.args;
          this.validateString(eventName);

          if (listener) {
            this.validateFunction(listener);
          }

          if (!events.has(eventName)) {
            return new EventEmitter([], [], this.environment).call();
          }

          const listeners = events.get(eventName)!;

          if (listener) {
            const index = listeners.findIndex((l) => l.listener === listener);
            if (index !== -1) {
              listeners.splice(index, 1);
            }
          } else {
            listeners.length = 0;
          }

          return new EventEmitter([], [], this.environment).call();
        }
      },

      removeListener: class extends EventMethodBuilder {
        override call() {
          const [eventName, listener] = this.args;
          this.validateString(eventName);
          this.validateFunction(listener);

          if (!events.has(eventName)) {
            return new EventEmitter([], [], this.environment).call();
          }

          const listeners = events.get(eventName)!;
          const index = listeners.findIndex((l) => l.listener === listener);

          if (index !== -1) {
            listeners.splice(index, 1);
          }

          return new EventEmitter([], [], this.environment).call();
        }
      },

      removeAllListeners: class extends EventMethodBuilder {
        override call() {
          const [eventName] = this.args;

          if (eventName) {
            this.validateString(eventName);
            if (events.has(eventName)) {
              events.get(eventName)!.length = 0;
            }
          } else {
            events.clear();
          }

          return new EventEmitter([], [], this.environment).call();
        }
      },

      setMaxListeners: class extends EventMethodBuilder {
        override call() {
          const [n] = this.args;
          this.validateNumber(n, "maxListeners");

          maxListeners.value = n;
          return new EventEmitter([], [], this.environment).call();
        }
      },

      getMaxListeners: class extends EventMethodBuilder {
        override call() {
          return maxListeners.value;
        }
      },

      listeners: class extends EventMethodBuilder {
        override call() {
          const [eventName] = this.args;
          this.validateString(eventName);

          if (!events.has(eventName)) {
            return [];
          }

          return events.get(eventName)!.map((l) => l.listener);
        }
      },

      listenerCount: class extends EventMethodBuilder {
        override call() {
          const [eventName] = this.args;
          this.validateString(eventName);

          return events.has(eventName) ? events.get(eventName)!.length : 0;
        }
      },

      eventNames: class extends EventMethodBuilder {
        override call() {
          return Array.from(events.keys());
        }
      },

      prependListener: class extends EventMethodBuilder {
        override call() {
          const [eventName, listener] = this.args;
          this.validateString(eventName);
          this.validateFunction(listener);

          if (!events.has(eventName)) {
            events.set(eventName, []);
          }

          const listeners = events.get(eventName)!;
          listeners.unshift({ listener, once: false, prepend: true });
          return new EventEmitter([], [], this.environment).call();
        }
      },

      prependOnceListener: class extends EventMethodBuilder {
        override call() {
          const [eventName, listener] = this.args;
          this.validateString(eventName);
          this.validateFunction(listener);

          if (!events.has(eventName)) {
            events.set(eventName, []);
          }

          const listeners = events.get(eventName)!;
          listeners.unshift({ listener, once: true, prepend: true });
          return new EventEmitter([], [], this.environment).call();
        }
      },

      rawListeners: class extends EventMethodBuilder {
        override call() {
          const [eventName] = this.args;
          this.validateString(eventName);

          if (!events.has(eventName)) {
            return [];
          }

          return events.get(eventName)!.map((l) => l.listener);
        }
      },

      [Environment.SymbolEvents]: events,

      [Environment.SymbolCaptureRejections]: captureRejections,

      [Environment.SymbolFormatedText]: `EventEmitter { events: ${events.size}, maxListeners: ${maxListeners.value} }`,
    };
  }
}

export { EventEmitter };
