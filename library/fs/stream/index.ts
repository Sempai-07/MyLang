import fs from "node:fs";
import stream from "node:stream";
import { FunctionBuilder, FunctionBuilderCodeError } from "../../FunctionBuilder";
import { Environment } from "../../../src/Environment";
import { type StmtType } from "../../../src/ast/StmtType";
import { isTypeArgs } from "../../utils/utils";
import { Bytes } from "../../bytes/Bytes";

abstract class StreamMethodBuilder extends FunctionBuilder {
  constructor(args: any[], astArgs: StmtType[], environment: Environment) {
    super(args, astArgs, environment);
  }

  get pkgInfo() {
    return {
      name: "fs/stream",
      path: __dirname,
    };
  }

  protected validatePath(filePath: any, argName: string = "path"): void {
    if (typeof filePath !== "string") {
      throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsTypeError, {
        propsName: argName,
        expectType: "string",
        received: isTypeArgs(filePath),
      });
    }
  }

  protected validateFunction(func: any, argName: string = "callback"): void {
    if (isTypeArgs(func) !== "function") {
      throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsTypeError, {
        propsName: argName,
        expectType: "function",
        received: isTypeArgs(func),
      });
    }
  }

  protected validateBuffer(buffer: any, argName: string = "data"): void {
    if (
      !(buffer instanceof Buffer) &&
      typeof buffer !== "string" &&
      !buffer?.[Environment.SymbolBuffer]
    ) {
      throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsTypeError, {
        propsName: argName,
        expectType: "buffer, bytes or string",
        received: isTypeArgs(buffer),
      });
    }
  }

  protected executeCallback(callbackFunc: any, args: any[]): any {
    if (this.isBuildModuleFunction(callbackFunc)) {
      return new callbackFunc(args, [], this.environment).call();
    }
    return callbackFunc.call(args.map((v) => ({ value: v })));
  }

  call() {
    throw new Error("Call is not implemented");
  }
}

class ReadableStream extends StreamMethodBuilder {
  public stream!: fs.ReadStream;

  override call() {
    const [filePath, options = {}] = this.args;
    this.validatePath(filePath);

    let stream!: fs.ReadStream;
    const eventHandlers: Map<string, any[]> = new Map();

    try {
      stream = fs.createReadStream(filePath, options);
      this.stream = stream;

      for (const [event, handlers] of eventHandlers) {
        for (const handler of handlers) {
          stream.on(event, handler);
        }
      }
    } catch (error: any) {
      throw this.throwErrorFormatters(error);
    }

    return {
      on: class extends StreamMethodBuilder {
        override call() {
          const [event, handler] = this.args;
          this.validateFunction(handler, "handler");

          const wrappedHandler = (...args: any[]) => {
            this.executeCallback(handler, [new Bytes(args, [], this.environment).call()]);
          };

          if (stream) {
            stream.on(event, wrappedHandler);
          } else {
            if (!eventHandlers.has(event)) {
              eventHandlers.set(event, []);
            }
            eventHandlers.get(event)!.push(wrappedHandler);
          }

          return new ReadableStream([filePath, options], [], this.environment);
        }
      },

      once: class extends StreamMethodBuilder {
        override call() {
          const [event, handler] = this.args;
          this.validateFunction(handler, "handler");

          const wrappedHandler = (...args: any[]) => {
            this.executeCallback(handler, [new Bytes(args, [], this.environment).call()]);
          };

          if (stream) {
            stream.once(event, wrappedHandler);
          }

          return new ReadableStream([filePath, options], [], this.environment);
        }
      },

      pause: class extends StreamMethodBuilder {
        override call() {
          if (stream) {
            stream.pause();
          }
          return null;
        }
      },

      resume: class extends StreamMethodBuilder {
        override call() {
          if (stream) {
            stream.resume();
          }
          return null;
        }
      },

      destroy: class extends StreamMethodBuilder {
        override call() {
          const [error] = this.args;
          if (stream) {
            stream.destroy(error);
          }
          return null;
        }
      },

      close: class extends StreamMethodBuilder {
        override call() {
          if (stream) {
            stream.close();
          }
          return null;
        }
      },

      read: class extends StreamMethodBuilder {
        override call() {
          const [size] = this.args;
          if (stream) {
            return stream.read(size);
          }
          return null;
        }
      },

      pipe: class extends StreamMethodBuilder {
        override call() {
          const [destination, options] = this.args;
          if (stream && destination.stream) {
            return stream.pipe(destination.stream, options);
          }
          return null;
        }
      },

      readable: class extends StreamMethodBuilder {
        override call() {
          return stream ? stream.readable : false;
        }
      },

      readableHighWaterMark: class extends StreamMethodBuilder {
        override call() {
          return stream ? stream.readableHighWaterMark : 0;
        }
      },

      path: class extends StreamMethodBuilder {
        override call() {
          return stream ? stream.path : filePath;
        }
      },

      [Environment.SymbolFormatedText]: `ReadableStream { path: "${filePath}" }`,
    };
  }
}

class WritableStream extends StreamMethodBuilder {
  public stream!: fs.WriteStream;

  override call() {
    const [filePath, options = {}] = this.args;
    this.validatePath(filePath);

    let stream!: fs.WriteStream;
    const eventHandlers: Map<string, any[]> = new Map();

    try {
      stream = fs.createWriteStream(filePath, options);
      this.stream = stream;

      for (const [event, handlers] of eventHandlers) {
        for (const handler of handlers) {
          stream.on(event, handler);
        }
      }
    } catch (error: any) {
      throw this.throwErrorFormatters(error);
    }

    return {
      on: class extends StreamMethodBuilder {
        override call() {
          const [event, handler] = this.args;
          this.validateFunction(handler, "handler");

          const wrappedHandler = (...args: any[]) => {
            this.executeCallback(handler, [new Bytes(args, [], this.environment).call()]);
          };

          if (stream) {
            stream.on(event, wrappedHandler);
          } else {
            if (!eventHandlers.has(event)) {
              eventHandlers.set(event, []);
            }
            eventHandlers.get(event)!.push(wrappedHandler);
          }

          return new WritableStream([filePath, options], [], this.environment);
        }
      },

      once: class extends StreamMethodBuilder {
        override call() {
          const [event, handler] = this.args;
          this.validateFunction(handler, "handler");

          const wrappedHandler = (...args: any[]) => {
            this.executeCallback(handler, [new Bytes(args, [], this.environment).call()]);
          };

          if (stream) {
            stream.once(event, wrappedHandler);
          }

          return new WritableStream([filePath, options], [], this.environment);
        }
      },

      write: class extends StreamMethodBuilder {
        override call() {
          let [chunk, encoding, callback] = this.args;
          this.validateBuffer(chunk);

          if (chunk?.[Environment.SymbolBuffer]) {
            chunk = chunk[Environment.SymbolBuffer];
          }

          if (stream) {
            if (callback) {
              this.validateFunction(callback);
              const wrappedCallback = (...args: any[]) => {
                this.executeCallback(callback, args);
              };
              return stream.write(chunk, encoding, wrappedCallback);
            }
            return stream.write(chunk, encoding);
          }
          return false;
        }
      },

      end: class extends StreamMethodBuilder {
        override call() {
          let [chunk, encoding, callback] = this.args;

          if (stream) {
            if (chunk !== undefined) {
              this.validateBuffer(chunk);
              if (chunk?.[Environment.SymbolBuffer]) {
                chunk = chunk[Environment.SymbolBuffer];
              }
            }
            if (callback) {
              this.validateFunction(callback);
              const wrappedCallback = (...args: any[]) => {
                this.executeCallback(callback, [new Bytes(args, [], this.environment).call()]);
              };
              stream.end(chunk, encoding, wrappedCallback);
            } else {
              stream.end(chunk, encoding);
            }
          }
          return null;
        }
      },

      destroy: class extends StreamMethodBuilder {
        override call() {
          const [error] = this.args;
          if (stream) {
            stream.destroy(error);
          }
          return null;
        }
      },

      close: class extends StreamMethodBuilder {
        override call() {
          if (stream) {
            stream.close();
          }
          return null;
        }
      },

      writable: class extends StreamMethodBuilder {
        override call() {
          return stream ? stream.writable : false;
        }
      },

      writableHighWaterMark: class extends StreamMethodBuilder {
        override call() {
          return stream ? stream.writableHighWaterMark : 0;
        }
      },

      path: class extends StreamMethodBuilder {
        override call() {
          return stream ? stream.path : filePath;
        }
      },

      [Environment.SymbolFormatedText]: `WritableStream { path: "${filePath}" }`,
    };
  }
}

class TransformStream extends StreamMethodBuilder {
  override call() {
    const [transformFn, options = {}] = this.args;
    this.validateFunction(transformFn);

    const transformStream = new stream.Transform({
      ...options,
      transform: (chunk: any, encoding: string, callback: Function) => {
        try {
          const result = this.executeCallback(transformFn, [
            [new Bytes(chunk, [], this.environment).call()],
            encoding,
          ]);
          callback(null, result);
        } catch (error: any) {
          callback(error);
        }
      },
    });

    return {
      pipe: class extends StreamMethodBuilder {
        override call() {
          const [destination, options] = this.args;
          if (destination.stream) {
            return transformStream.pipe(destination.stream, options);
          }
          return null;
        }
      },

      write: class extends StreamMethodBuilder {
        override call() {
          const [chunk, encoding, callback] = this.args;
          if (callback) {
            this.validateFunction(callback);
            const wrappedCallback = (...args: any[]) => {
              this.executeCallback(callback, [new Bytes(args, [], this.environment).call()]);
            };
            return transformStream.write(chunk, encoding, wrappedCallback);
          }
          return transformStream.write(chunk, encoding);
        }
      },

      end: class extends StreamMethodBuilder {
        override call() {
          const [chunk, encoding, callback] = this.args;
          if (callback) {
            this.validateFunction(callback);
            const wrappedCallback = (...args: any[]) => {
              this.executeCallback(callback, [new Bytes(args, [], this.environment).call()]);
            };
            transformStream.end(chunk, encoding, wrappedCallback);
          } else {
            transformStream.end(chunk, encoding);
          }
          return null;
        }
      },

      [Environment.SymbolFormatedText]: `TransformStream { }`,
    };
  }
}

module.exports = {
  ReadableStream,
  WritableStream,
  TransformStream,
};
