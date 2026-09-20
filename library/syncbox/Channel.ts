import { FunctionBuilder } from "../FunctionBuilder";
import { Environment } from "../../src/Environment";
import { type StmtType } from "../../src/ast/StmtType";
import { BaseError } from "../../src/errors/BaseError";

type ChannelOptions<T> = {
  mode?: "fifo" | "lifo";
  drop?: "oldest" | "newest";
  strict?: boolean;
  replay?: number;
  timeout?: number;
  onSend?: (value: T) => void;
  onRecv?: (value: T | null) => void;
  onClose?: () => void;
  ttl?: number;
};

class Channel<T> {
  private buffer: T[] = [];
  private replayBuffer: T[] = [];
  private sendQueue: { value: T; resolve: (value: any) => void }[] = [];
  private recvQueue: ((value: T | null) => void)[] = [];
  private bufferSize: number;
  private closed = false;
  private options: ChannelOptions<T>;
  private createdAt: number = Date.now();

  constructor(bufferSize = 0, options: ChannelOptions<T> = {}) {
    this.bufferSize = bufferSize;
    this.options = options;
  }

  private isExpired(): boolean {
    if (!this.options.ttl) return false;
    return Date.now() - this.createdAt > this.options.ttl;
  }

  private pushToBuffer(value: T): void {
    if (this.options.mode === "lifo") {
      this.buffer.unshift(value);
    } else {
      this.buffer.push(value);
    }
  }

  private storeReplay(value: T): void {
    if (typeof this.options.replay === "number" && this.options.replay > 0) {
      this.replayBuffer.push(value);
      if (this.replayBuffer.length > this.options.replay) {
        this.replayBuffer.shift();
      }
    }
  }

  replayClear() {
    const channel = this;
    return class extends FunctionBuilder {
      constructor(args: any[] = [], astArgs: StmtType[] = [], environment: Environment) {
        super(args, astArgs, environment);
      }

      get pkgInfo() {
        return { name: "syncbox", path: __dirname };
      }

      call(): void {
        if (channel.options.replay) {
          channel.replayBuffer = [];
        }
      }
    };
  }

  getReplay() {
    const channel = this;
    return class extends FunctionBuilder {
      constructor(args: any[] = [], astArgs: StmtType[] = [], environment: Environment) {
        super(args, astArgs, environment);
      }

      get pkgInfo() {
        return { name: "syncbox", path: __dirname };
      }

      call(): T[] {
        if (!channel.options.replay) return [];
        return [...channel.replayBuffer];
      }
    };
  }

  close(): any {
    const channel = this;
    return class extends FunctionBuilder {
      constructor(args: any[] = [], astArgs: StmtType[] = [], environment: Environment) {
        super(args, astArgs, environment);
      }

      get pkgInfo() {
        return { name: "syncbox", path: __dirname };
      }

      call(): void {
        channel.closed = true;
        channel.recvQueue.forEach((resolve) => resolve(null));
        channel.recvQueue = [];
        channel.sendQueue.forEach(({ resolve }) => resolve(null));
        channel.sendQueue = [];
        channel.options.onClose?.();
      }
    };
  }

  isClosed(): any {
    const channel = this;
    return class extends FunctionBuilder {
      constructor(args: any[] = [], astArgs: StmtType[] = [], environment: Environment) {
        super(args, astArgs, environment);
      }

      get pkgInfo() {
        return { name: "syncbox", path: __dirname };
      }

      call(): boolean {
        return channel.closed;
      }
    };
  }

  len(): any {
    const channel = this;
    return class extends FunctionBuilder {
      constructor(args: any[] = [], astArgs: StmtType[] = [], environment: Environment) {
        super(args, astArgs, environment);
      }

      get pkgInfo() {
        return { name: "syncbox", path: __dirname };
      }

      call(): number {
        return channel.buffer.length;
      }
    };
  }

  cap(): any {
    const channel = this;
    return class extends FunctionBuilder {
      constructor(args: any[] = [], astArgs: StmtType[] = [], environment: Environment) {
        super(args, astArgs, environment);
      }

      get pkgInfo() {
        return { name: "syncbox", path: __dirname };
      }

      call(): number {
        return channel.bufferSize;
      }
    };
  }

  trySend(): any {
    const channel = this;
    return class extends FunctionBuilder {
      constructor(args: any[] = [], astArgs: StmtType[] = [], environment: Environment) {
        super(args, astArgs, environment);
      }

      get pkgInfo() {
        return { name: "syncbox", path: __dirname };
      }

      call(): boolean {
        const [value] = this.args;
        if (channel.closed || channel.isExpired()) return false;

        if (channel.recvQueue.length > 0) {
          const recv = channel.recvQueue.shift()!;
          recv(value);
          channel.options.onSend?.(value);
          channel.storeReplay(value);
          return true;
        }

        if (channel.buffer.length < channel.bufferSize) {
          channel.pushToBuffer(value);
          channel.options.onSend?.(value);
          channel.storeReplay(value);
          return true;
        }

        if (channel.options.drop === "oldest") {
          channel.buffer.shift();
          channel.pushToBuffer(value);
          channel.options.onSend?.(value);
          channel.storeReplay(value);
          return true;
        }

        if (channel.options.drop === "newest") {
          return false;
        }

        return false;
      }
    };
  }

  tryRecv(): any {
    const channel = this;
    return class extends FunctionBuilder {
      constructor(args: any[] = [], astArgs: StmtType[] = [], environment: Environment) {
        super(args, astArgs, environment);
      }

      get pkgInfo() {
        return { name: "syncbox", path: __dirname };
      }

      call(): T | null {
        if (channel.replayBuffer.length > 0) {
          const value = channel.replayBuffer[0] ?? null;
          channel.options.onRecv?.(value);
          return value;
        }

        if (channel.buffer.length > 0) {
          const value = channel.buffer.shift() ?? null;
          channel.options.onRecv?.(value);
          return value;
        }

        if (channel.sendQueue.length > 0) {
          const { value, resolve } = channel.sendQueue.shift()!;
          const valueDefault = value ?? null;

          resolve(valueDefault);
          channel.options.onRecv?.(valueDefault);
          return valueDefault;
        }

        channel.options.onRecv?.(null);
        return null;
      }
    };
  }

  send(): any {
    const channel = this;
    return class extends FunctionBuilder {
      constructor(args: any[] = [], astArgs: StmtType[] = [], environment: Environment) {
        super(args, astArgs, environment);
      }

      get pkgInfo() {
        return { name: "syncbox", path: __dirname };
      }

      async call(): Promise<any> {
        const [value] = this.args;

        if (channel.closed || channel.isExpired()) {
          throw new BaseError("cannot send on closed or expired channel");
        }

        if (channel.recvQueue.length > 0) {
          const recv = channel.recvQueue.shift()!;
          recv(value);
          channel.options.onSend?.(value);
          channel.storeReplay(value);
          return;
        }

        if (channel.buffer.length < channel.bufferSize) {
          channel.pushToBuffer(value);
          channel.options.onSend?.(value);
          channel.storeReplay(value);
          return;
        }

        if (channel.options.drop === "oldest") {
          channel.buffer.shift();
          channel.pushToBuffer(value);
          channel.options.onSend?.(value);
          channel.storeReplay(value);
          return;
        }

        if (channel.options.drop === "newest") {
          return;
        }

        return await new Promise((resolve) => {
          channel.sendQueue.push({ value, resolve });
        });
      }
    };
  }

  recv(): any {
    const channel = this;
    return class extends FunctionBuilder {
      constructor(args: any[] = [], astArgs: StmtType[] = [], environment: Environment) {
        super(args, astArgs, environment);
      }

      get pkgInfo() {
        return { name: "syncbox", path: __dirname };
      }

      async call(): Promise<T | null> {
        if (channel.replayBuffer.length > 0) {
          const value = channel.replayBuffer[0] ?? null;
          channel.options.onRecv?.(value);
          return value;
        }

        if (channel.buffer.length > 0) {
          const value = channel.buffer.shift() ?? null;
          channel.options.onRecv?.(value);
          return value;
        }

        if (channel.sendQueue.length > 0) {
          const { value, resolve } = channel.sendQueue.shift()!;
          const valueDefault = value ?? null;

          resolve(valueDefault);
          channel.options.onRecv?.(valueDefault);
          return valueDefault;
        }

        if (channel.closed || channel.isExpired()) {
          channel.options.onRecv?.(null);
          return null;
        }

        return await new Promise<T | null>((resolve) => {
          const handle = (value: T | null) => {
            channel.options.onRecv?.(value);
            resolve(value);
          };

          if (channel.options.timeout) {
            const timeout = setTimeout(() => handle(null), channel.options.timeout);
            channel.recvQueue.push((value) => {
              clearTimeout(timeout);
              handle(value);
            });
          } else {
            channel.recvQueue.push(handle);
          }
        });
      }
    };
  }
}

export { Channel };
