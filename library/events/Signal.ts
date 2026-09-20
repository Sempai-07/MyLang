import { EventMethodBuilder } from "./EventsBuilder";
import { Environment } from "../../src/Environment";
import { type FunctionBuilder } from "../FunctionBuilder";

interface ISlots {
  id: number;
  slot: typeof FunctionBuilder;
  priority: number;
  once: boolean;
  weak: boolean;
  group: string;
  connected: boolean;
  blocked?: boolean;
}

class Signal extends EventMethodBuilder {
  override call() {
    const slots: ISlots[] = [];
    let blocked = false;
    const connectionCounter = { value: 0 };

    return {
      connect: class extends EventMethodBuilder {
        override call() {
          const [slot, options = {}] = this.args;
          this.validateFunction(slot);

          const { priority = 0, once = false, weak = false, group = null } = options || {};

          const connection: ISlots = {
            id: ++connectionCounter.value,
            slot,
            priority,
            once,
            weak,
            group,
            connected: true,
          };

          slots.push(connection);
          slots.sort((a, b) => b.priority - a.priority);

          return {
            disconnect: class extends EventMethodBuilder {
              override call() {
                connection!.connected = false;
                const index = slots.findIndex((s) => s.id === connection!.id);
                if (index !== -1) {
                  slots.splice(index, 1);
                }
              }
            },
            isConnected: class extends EventMethodBuilder {
              override call() {
                return connection!.connected;
              }
            },
            block: class extends EventMethodBuilder {
              override call() {
                return (connection!.blocked = true);
              }
            },
            unblock: class extends EventMethodBuilder {
              override call() {
                return (connection!.blocked = false);
              }
            },
            isBlocked: class extends EventMethodBuilder {
              override call() {
                return !!connection!.blocked;
              }
            },
          };
        }
      },

      emit: class extends EventMethodBuilder {
        override async call() {
          const args = this.args;

          if (blocked) {
            return [];
          }

          const results = [];
          const connectionsToRemove = [];

          for (let i = 0; i < slots.length; i++) {
            const connection = slots[i]!;

            if (!connection.connected || connection.blocked) {
              continue;
            }

            try {
              const result = await this.executeListener(connection.slot, args);
              results.push(result);

              if (connection.once) {
                connectionsToRemove.push(i);
              }
            } catch (error) {
              console.error("Error in signal slot:", error);
              results.push(error);
            }
          }

          for (let i = connectionsToRemove.length - 1; i >= 0; i--) {
            const connection = slots[connectionsToRemove[i]!]!;
            connection.connected = false;
            slots.splice(connectionsToRemove[i]!, 1);
          }

          return results;
        }
      },

      disconnectAll: class extends EventMethodBuilder {
        override call() {
          const [group] = this.args;

          if (group) {
            this.validateString(group);

            for (let i = slots.length - 1; i >= 0; i--) {
              if (slots[i]?.group === group) {
                slots[i]!.connected = false;
                slots.splice(i, 1);
              }
            }
          } else {
            for (const connection of slots) {
              connection.connected = false;
            }
            slots.length = 0;
          }

          return new Signal([], [], this.environment).call();
        }
      },

      block: class extends EventMethodBuilder {
        override call() {
          blocked = true;
          return new Signal([], [], this.environment).call();
        }
      },

      unblock: class extends EventMethodBuilder {
        override call() {
          blocked = false;
          return new Signal([], [], this.environment).call();
        }
      },

      isBlocked: class extends EventMethodBuilder {
        override call() {
          return blocked;
        }
      },

      connectionCount: class extends EventMethodBuilder {
        override call() {
          const [group] = this.args;

          if (group) {
            this.validateString(group);
            return slots.filter((s) => s.group === group && s.connected).length;
          }

          return slots.filter((s) => s.connected).length;
        }
      },

      hasConnections: class extends EventMethodBuilder {
        override call() {
          return slots.some((s) => s.connected);
        }
      },

      getConnections: class extends EventMethodBuilder {
        override call() {
          const [group] = this.args;

          if (group) {
            this.validateString(group);
            return slots
              .filter((s) => s.group === group && s.connected)
              .map((s) => ({
                id: s.id,
                priority: s.priority,
                once: s.once,
                group: s.group,
                blocked: !!s.blocked,
              }));
          }

          return slots
            .filter((s) => s.connected)
            .map((s) => ({
              id: s.id,
              priority: s.priority,
              once: s.once,
              group: s.group,
              blocked: !!s.blocked,
            }));
        }
      },

      [Environment.SymbolFormatedText]: `Signal { connections: ${slots.filter((s) => s.connected).length}, blocked: ${blocked} }`,
    };
  }
}

export { Signal };
