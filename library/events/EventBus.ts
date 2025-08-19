import { EventMethodBuilder } from "./EventsBuilder";
import { Environment } from "../../src/Environment";
import { type FunctionBuilder } from "../FunctionBuilder";

interface IEvents {
  listener: typeof FunctionBuilder;
  once: boolean;
  priority: number;
}

interface IHistory {
  name: string;
  data: any;
  timestamp: number;
  namespace: string;
  preventDefault: boolean;
  stopPropagation: boolean;
}

class EventBus extends EventMethodBuilder {
  override call() {
    const namespaces = new Map<string, Map<string, IEvents[]>>();
    const middleware: (typeof FunctionBuilder)[] = [];
    const history: IHistory[] = [];
    const maxHistory = { value: 100 };

    return {
      on: class extends EventMethodBuilder {
        override call() {
          const [eventPattern, listener, options = {}] = this.args;
          this.validateString(eventPattern);
          this.validateFunction(listener);

          const { namespace = "default", priority = 0 } = options;

          if (!namespaces.has(namespace)) {
            namespaces.set(namespace, new Map());
          }

          const nsEvents = namespaces.get(namespace)!;

          if (!nsEvents.has(eventPattern)) {
            nsEvents.set(eventPattern, []);
          }

          const listeners = nsEvents.get(eventPattern)!;
          listeners.push({ listener, priority, once: false });

          listeners.sort((a, b) => b.priority - a.priority);

          return new EventBus([], [], this.environment).call();
        }
      },

      once: class extends EventMethodBuilder {
        override call() {
          const [eventPattern, listener, options = {}] = this.args;
          this.validateString(eventPattern);
          this.validateFunction(listener);

          const { namespace = "default", priority = 0 } = options;

          if (!namespaces.has(namespace)) {
            namespaces.set(namespace, new Map());
          }

          const nsEvents = namespaces.get(namespace)!;

          if (!nsEvents.has(eventPattern)) {
            nsEvents.set(eventPattern, []);
          }

          const listeners = nsEvents.get(eventPattern)!;
          listeners.push({ listener, priority, once: true });
          listeners.sort((a, b) => b.priority - a.priority);

          return new EventBus([], [], this.environment).call();
        }
      },

      emit: class extends EventMethodBuilder {
        override async call() {
          const [eventName, data, options = {}] = this.args;
          this.validateString(eventName);

          const { namespace = "default", sync = false } = options;
          const eventObj: IHistory = {
            name: eventName,
            data,
            timestamp: Date.now(),
            namespace,
            preventDefault: false,
            stopPropagation: false,
          };

          history.push(eventObj);
          if (history.length > maxHistory.value) {
            history.shift();
          }

          for (const mw of middleware) {
            try {
              await this.executeListener(mw, [eventObj]);
              if (eventObj.preventDefault) {
                return false;
              }
            } catch (error) {
              console.error("Middleware error:", error);
            }
          }

          const matchingListeners = [];

          if (namespaces.has(namespace)) {
            const nsEvents = namespaces.get(namespace)!;

            for (const [pattern, listeners] of nsEvents) {
              if (this.matchesPattern(eventName, pattern)) {
                matchingListeners.push(...listeners);
              }
            }
          }

          matchingListeners.sort((a, b) => b.priority - a.priority);

          const listenersToRemove = [];

          if (sync) {
            for (let i = 0; i < matchingListeners.length; i++) {
              const { listener, once } = matchingListeners[i]!;

              try {
                await this.executeListener(listener, [eventObj]);

                if (once) {
                  listenersToRemove.push({ listener, namespace });
                }

                if (eventObj.stopPropagation) {
                  break;
                }
              } catch (error) {
                console.error(`Error in listener for ${eventName}:`, error);
              }
            }
          } else {
            const promises = matchingListeners.map(async ({ listener, once }) => {
              try {
                await this.executeListener(listener, [eventObj]);

                if (once) {
                  listenersToRemove.push({ listener, namespace });
                }
              } catch (error) {
                console.error(`Error in listener for ${eventName}:`, error);
              }
            });

            await Promise.allSettled(promises);
          }

          for (const { listener, namespace: ns } of listenersToRemove) {
            const nsEvents = namespaces.get(ns)!;
            for (const [_, listeners] of nsEvents) {
              const index = listeners.findIndex((l) => l.listener === listener);
              if (index !== -1) {
                listeners.splice(index, 1);
              }
            }
          }

          return true;
        }

        private matchesPattern(eventName: string, pattern: string): boolean {
          if (pattern === eventName) return true;
          if (pattern === "*") return true;

          if (pattern.includes("*")) {
            const regexPattern = pattern.replace(/\./g, "\\.").replace(/\*/g, ".*");
            return new RegExp(`^${regexPattern}$`).test(eventName);
          }

          return false;
        }
      },

      off: class extends EventMethodBuilder {
        override call() {
          const [eventPattern, listener, options = {}] = this.args;
          this.validateString(eventPattern);

          const { namespace = "default" } = options;

          if (!namespaces.has(namespace)) {
            return new EventBus([], [], this.environment).call();
          }

          const nsEvents = namespaces.get(namespace)!;

          if (listener) {
            this.validateFunction(listener);

            if (nsEvents.has(eventPattern)) {
              const listeners = nsEvents.get(eventPattern)!;
              const index = listeners.findIndex((l) => l.listener === listener);
              if (index !== -1) {
                listeners.splice(index, 1);
              }
            }
          } else {
            nsEvents.delete(eventPattern);
          }

          return new EventBus([], [], this.environment).call();
        }
      },

      use: class extends EventMethodBuilder {
        override call() {
          const [middlewareFunc] = this.args;
          this.validateFunction(middlewareFunc, "middleware");

          middleware.push(middlewareFunc);
          return new EventBus([], [], this.environment).call();
        }
      },

      removeMiddleware: class extends EventMethodBuilder {
        override call() {
          const [middlewareFunc] = this.args;
          this.validateFunction(middlewareFunc, "middleware");

          const index = middleware.findIndex((mw) => mw === middlewareFunc);
          if (index !== -1) {
            middleware.splice(index, 1);
          }

          return new EventBus([], [], this.environment).call();
        }
      },

      clearNamespace: class extends EventMethodBuilder {
        override call() {
          const [namespace] = this.args;
          this.validateString(namespace);

          if (namespaces.has(namespace)) {
            namespaces.get(namespace)!.clear();
          }

          return new EventBus([], [], this.environment).call();
        }
      },

      getHistory: class extends EventMethodBuilder {
        override call() {
          const [eventPattern, limit] = this.args;

          let filtered = history;

          if (eventPattern) {
            this.validateString(eventPattern);
            filtered = history.filter((event) => {
              if (eventPattern === "*") return true;
              if (eventPattern.includes("*")) {
                const regexPattern = eventPattern.replace(/\./g, "\\.").replace(/\*/g, ".*");
                return new RegExp(`^${regexPattern}$`).test(event.name);
              }
              return event.name === eventPattern;
            });
          }

          if (limit) {
            this.validateNumber(limit, "limit");
            filtered = filtered.slice(-limit);
          }

          return filtered.map((event) => ({ ...event }));
        }
      },

      clearHistory: class extends EventMethodBuilder {
        override call() {
          history.length = 0;
          return new EventBus([], [], this.environment).call();
        }
      },

      setMaxHistory: class extends EventMethodBuilder {
        override call() {
          const [max] = this.args;
          this.validateNumber(max, "maxHistory");

          maxHistory.value = max;

          while (history.length > max) {
            history.shift();
          }

          return new EventBus([], [], this.environment).call();
        }
      },

      getNamespaces: class extends EventMethodBuilder {
        override call() {
          return Array.from(namespaces.keys());
        }
      },

      getEvents: class extends EventMethodBuilder {
        override call() {
          const [namespace = "default"] = this.args;
          this.validateString(namespace);

          if (!namespaces.has(namespace)) {
            return [];
          }

          return Array.from(namespaces.get(namespace)!.keys());
        }
      },

      [Environment.SymbolFormatedText]: `EventBus { namespaces: ${namespaces.size}, history: ${history.length}/${maxHistory.value} }`,
    };
  }
}

export { EventBus };
