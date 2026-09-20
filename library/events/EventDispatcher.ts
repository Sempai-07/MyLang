import { EventMethodBuilder } from "./EventsBuilder";
import { Environment } from "../../src/Environment";
import { type FunctionBuilder } from "../FunctionBuilder";
import { isTypeArgs } from "../utils/utils";

interface IListeners {
  listener: typeof FunctionBuilder;
  priority: number;
  once: boolean;
  passive?: boolean;
  id: string;
}

class EventDispatcher extends EventMethodBuilder {
  override call() {
    const listeners = new Map<string, IListeners[]>();
    const beforeListeners = new Map<string, IListeners[]>();
    const afterListeners = new Map<string, IListeners[]>();
    const propagationStopped = new Set<string>();
    const defaultPrevented = new Set<string>();

    return {
      addEventListener: class extends EventMethodBuilder {
        override call() {
          const [eventType, listener, options = {}] = this.args;
          this.validateString(eventType);
          this.validateFunction(listener);

          const { priority = 0, once = false, passive = false, capture = false } = options || {};

          const targetMap = capture ? beforeListeners : listeners;

          if (!targetMap.has(eventType)) {
            targetMap.set(eventType, []);
          }

          const eventListeners = targetMap.get(eventType)!;
          eventListeners.push({
            listener,
            priority,
            once,
            passive,
            id: `${eventType}_${Date.now()}_${Math.random()}`,
          });

          eventListeners.sort((a, b) => b.priority - a.priority);
          return new EventDispatcher([], [], this.environment).call();
        }
      },

      removeEventListener: class extends EventMethodBuilder {
        override call() {
          const [eventType, listener, options = {}] = this.args;
          this.validateString(eventType);
          this.validateFunction(listener);

          const { capture = false } = options;
          const targetMap = capture ? beforeListeners : listeners;

          if (!targetMap.has(eventType)) {
            return new EventDispatcher([], [], this.environment).call();
          }

          const eventListeners = targetMap.get(eventType)!;
          const index = eventListeners.findIndex((l) => l.listener === listener);

          if (index !== -1) {
            eventListeners.splice(index, 1);
          }

          return new EventDispatcher([], [], this.environment).call();
        }
      },

      dispatchEvent: class extends EventMethodBuilder {
        override async call() {
          const [event] = this.args;

          if (isTypeArgs(event) === "string") {
            const eventObj = {
              type: event,
              target: this,
              currentTarget: this,
              bubbles: false,
              cancelable: false,
              defaultPrevented: false,
              timeStamp: Date.now(),
              preventDefault: () => {
                if (eventObj.cancelable) {
                  eventObj.defaultPrevented = true;
                  defaultPrevented.add(event);
                }
              },
              stopPropagation: () => {
                propagationStopped.add(event);
              },
            };

            return await this.processEvent(eventObj);
          } else if (isTypeArgs(event) === "object" && event.type) {
            const eventObj = {
              ...event,
              target: this,
              currentTarget: this,
              defaultPrevented: false,
              timeStamp: Date.now(),
              preventDefault: () => {
                if (eventObj.cancelable) {
                  eventObj.defaultPrevented = true;
                  defaultPrevented.add(event.type);
                }
              },
              stopPropagation: () => {
                propagationStopped.add(event.type);
              },
            };

            return await this.processEvent(eventObj);
          } else {
            throw this.throwErrorFormatters(
              new Error("Event must be a string or event object with type property"),
            );
          }
        }

        private async processEvent(eventObj: any) {
          const eventType = eventObj.type;

          if (beforeListeners.has(eventType)) {
            const beforeList = beforeListeners.get(eventType)!;
            await this.executePhaseListeners(beforeList, eventObj, eventType);
          }

          if (propagationStopped.has(eventType)) {
            propagationStopped.delete(eventType);
            return !eventObj.defaultPrevented;
          }

          if (listeners.has(eventType)) {
            const mainList = listeners.get(eventType)!;
            await this.executePhaseListeners(mainList, eventObj, eventType);
          }

          if (propagationStopped.has(eventType)) {
            propagationStopped.delete(eventType);
            return !eventObj.defaultPrevented;
          }

          if (afterListeners.has(eventType)) {
            const afterList = afterListeners.get(eventType)!;
            await this.executePhaseListeners(afterList, eventObj, eventType);
          }

          propagationStopped.delete(eventType);
          const wasDefaultPrevented = defaultPrevented.has(eventType);
          defaultPrevented.delete(eventType);

          return !wasDefaultPrevented;
        }

        private async executePhaseListeners(listenerList: any[], eventObj: any, eventType: string) {
          const listenersToRemove = [];

          for (let i = 0; i < listenerList.length; i++) {
            const { listener, once, passive } = listenerList[i];

            if (propagationStopped.has(eventType)) {
              break;
            }

            try {
              if (!passive) {
                await this.executeListener(listener, [eventObj]);
              } else {
                const passiveEvent = { ...eventObj };
                delete passiveEvent.preventDefault;
                delete passiveEvent.stopPropagation;
                await this.executeListener(listener, [passiveEvent]);
              }

              if (once) {
                listenersToRemove.push(i);
              }
            } catch (error) {
              console.error(`Error in event listener for ${eventType}:`, error);
            }
          }

          for (let i = listenersToRemove.length - 1; i >= 0; i--) {
            listenerList.splice(listenersToRemove[i]!, 1);
          }
        }
      },

      addAfterListener: class extends EventMethodBuilder {
        override call() {
          const [eventType, listener, options = {}] = this.args;
          this.validateString(eventType);
          this.validateFunction(listener);

          const { priority = 0, once = false } = options;

          if (!afterListeners.has(eventType)) {
            afterListeners.set(eventType, []);
          }

          const eventListeners = afterListeners.get(eventType)!;
          eventListeners.push({
            listener,
            priority,
            once,
            id: `${eventType}_after_${Date.now()}_${Math.random()}`,
          });

          eventListeners.sort((a, b) => b.priority - a.priority);
          return new EventDispatcher([], [], this.environment).call();
        }
      },

      hasEventListener: class extends EventMethodBuilder {
        override call() {
          const [eventType, listener] = this.args;
          this.validateString(eventType);

          if (listener) {
            this.validateFunction(listener);

            const checkInMap = (map: Map<string, any[]>) => {
              if (!map.has(eventType)) return false;
              return map.get(eventType)!.some((l) => l.listener === listener);
            };

            return (
              checkInMap(listeners) || checkInMap(beforeListeners) || checkInMap(afterListeners)
            );
          }

          return (
            listeners.has(eventType) ||
            beforeListeners.has(eventType) ||
            afterListeners.has(eventType)
          );
        }
      },

      getEventListeners: class extends EventMethodBuilder {
        override call() {
          const [eventType] = this.args;
          this.validateString(eventType);

          const result = {
            capture: beforeListeners.has(eventType)
              ? beforeListeners.get(eventType)!.map((l) => l.listener)
              : [],
            target: listeners.has(eventType)
              ? listeners.get(eventType)!.map((l) => l.listener)
              : [],
            bubble: afterListeners.has(eventType)
              ? afterListeners.get(eventType)!.map((l) => l.listener)
              : [],
          };

          return result;
        }
      },

      clearEventListeners: class extends EventMethodBuilder {
        override call() {
          const [eventType] = this.args;

          if (eventType) {
            this.validateString(eventType);
            listeners.delete(eventType);
            beforeListeners.delete(eventType);
            afterListeners.delete(eventType);
          } else {
            listeners.clear();
            beforeListeners.clear();
            afterListeners.clear();
          }

          return new EventDispatcher([], [], this.environment).call();
        }
      },

      getEventTypes: class extends EventMethodBuilder {
        override call() {
          const types = new Set([
            ...listeners.keys(),
            ...beforeListeners.keys(),
            ...afterListeners.keys(),
          ]);

          return Array.from(types);
        }
      },

      [Environment.SymbolFormatedText]: `EventDispatcher { events: ${listeners.size + beforeListeners.size + afterListeners.size} }`,
    };
  }
}

export { EventDispatcher };
