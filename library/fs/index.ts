import fs from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import { FunctionBuilder, FunctionBuilderCodeError } from "../FunctionBuilder";
import { Environment } from "../../src/Environment";
import { type StmtType } from "../../src/ast/StmtType";
import { isTypeArgs } from "../utils/utils";
import { Bytes } from "../bytes/Bytes";

const fsAsync = {
  readFile: promisify(fs.readFile),
  writeFile: promisify(fs.writeFile),
  readdir: promisify(fs.readdir),
  stat: promisify(fs.stat),
  lstat: promisify(fs.lstat),
  mkdir: promisify(fs.mkdir),
  rmdir: promisify(fs.rmdir),
  unlink: promisify(fs.unlink),
  rename: promisify(fs.rename),
  copyFile: promisify(fs.copyFile),
  access: promisify(fs.access),
  chmod: promisify(fs.chmod),
  chown: promisify(fs.chown),
  utimes: promisify(fs.utimes),
  realpath: promisify(fs.realpath),
  symlink: promisify(fs.symlink),
  readlink: promisify(fs.readlink),
  truncate: promisify(fs.truncate),
  appendFile: promisify(fs.appendFile),
};

abstract class FSMethodBuilder extends FunctionBuilder {
  constructor(args: any[], astArgs: StmtType[], environment: Environment) {
    super(args, astArgs, environment);
  }

  get pkgInfo() {
    return {
      name: "fs",
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

  protected validateNumber(value: any, argName: string): void {
    if (typeof value !== "number") {
      throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsTypeError, {
        propsName: argName,
        expectType: "number",
        received: isTypeArgs(value),
      });
    }
  }

  protected executeCallback(callbackFunc: any, args: any[]): any {
    if (this.isBuildModuleFunction(callbackFunc)) {
      return new callbackFunc(args, [], this.environment).call();
    }
    return callbackFunc.call(args.map((v) => ({ value: v })));
  }

  protected processBuffer(buffer: any): Buffer | string {
    if (buffer?.[Environment.SymbolBuffer]) {
      return buffer[Environment.SymbolBuffer];
    }
    return buffer;
  }

  call() {
    throw new Error("Call is not implemented");
  }
}

class ReadFile extends FSMethodBuilder {
  override call() {
    const [filePath, options, callback] = this.args;
    this.validatePath(filePath);

    const hasCallback = callback !== undefined;
    const actualOptions = hasCallback ? options : {};
    const actualCallback = hasCallback ? callback : options;

    if (actualCallback && isTypeArgs(actualCallback) === "function") {
      fs.readFile(filePath, actualOptions, (err, data) => {
        const callbackArgs = err ? [err] : [null, new Bytes([data], [], this.environment).call()];
        this.executeCallback(actualCallback, callbackArgs);
      });
      return null;
    } else {
      try {
        const data = fs.readFileSync(filePath, actualOptions);
        return new Bytes([data], [], this.environment).call();
      } catch (error: any) {
        throw this.throwErrorFormatters(error);
      }
    }
  }
}

class WriteFile extends FSMethodBuilder {
  override call() {
    const [filePath, data, options, callback] = this.args;
    this.validatePath(filePath);
    this.validateBuffer(data);

    const processedData = this.processBuffer(data);
    const hasCallback = callback !== undefined;
    const actualOptions = hasCallback ? options : {};
    const actualCallback = hasCallback ? callback : options;

    if (actualCallback && isTypeArgs(actualCallback) === "function") {
      fs.writeFile(filePath, processedData, actualOptions, (err) => {
        this.executeCallback(actualCallback, err ? [err] : [null]);
      });
      return null;
    } else {
      try {
        fs.writeFileSync(filePath, processedData, actualOptions);
        return null;
      } catch (error: any) {
        throw this.throwErrorFormatters(error);
      }
    }
  }
}

class AppendFile extends FSMethodBuilder {
  override call() {
    const [filePath, data, options, callback] = this.args;
    this.validatePath(filePath);
    this.validateBuffer(data);

    const processedData = this.processBuffer(data);
    const hasCallback = callback !== undefined;
    const actualOptions = hasCallback ? options : {};
    const actualCallback = hasCallback ? callback : options;

    if (actualCallback && isTypeArgs(actualCallback) === "function") {
      fs.appendFile(filePath, processedData, actualOptions, (err) => {
        this.executeCallback(actualCallback, err ? [err] : [null]);
      });
      return null;
    } else {
      try {
        fs.appendFileSync(filePath, processedData, actualOptions);
        return null;
      } catch (error: any) {
        throw this.throwErrorFormatters(error);
      }
    }
  }
}

class ReadDir extends FSMethodBuilder {
  override call() {
    const [dirPath, options, callback] = this.args;
    this.validatePath(dirPath);

    const hasCallback = callback !== undefined;
    const actualOptions = hasCallback ? options : {};
    const actualCallback = hasCallback ? callback : options;

    if (actualCallback && isTypeArgs(actualCallback) === "function") {
      fs.readdir(dirPath, actualOptions, (err, files) => {
        const callbackArgs = err ? [err] : [null, files];
        this.executeCallback(actualCallback, callbackArgs);
      });
      return null;
    } else {
      try {
        return fs.readdirSync(dirPath, actualOptions);
      } catch (error: any) {
        throw this.throwErrorFormatters(error);
      }
    }
  }
}

class MakeDir extends FSMethodBuilder {
  override call() {
    const [dirPath, options, callback] = this.args;
    this.validatePath(dirPath);

    const hasCallback = callback !== undefined;
    const actualOptions = hasCallback ? options : {};
    const actualCallback = hasCallback ? callback : options;

    if (actualCallback && isTypeArgs(actualCallback) === "function") {
      fs.mkdir(dirPath, actualOptions, (err, path) => {
        const callbackArgs = err ? [err] : [null, path];
        this.executeCallback(actualCallback, callbackArgs);
      });
      return null;
    } else {
      try {
        return fs.mkdirSync(dirPath, actualOptions);
      } catch (error: any) {
        throw this.throwErrorFormatters(error);
      }
    }
  }
}

class RemoveDir extends FSMethodBuilder {
  override call() {
    const [dirPath, options, callback] = this.args;
    this.validatePath(dirPath);

    const hasCallback = callback !== undefined;
    const actualOptions = hasCallback ? options : {};
    const actualCallback = hasCallback ? callback : options;

    if (actualCallback && isTypeArgs(actualCallback) === "function") {
      if (fs.rm) {
        fs.rm(dirPath, actualOptions, (err) => {
          this.executeCallback(actualCallback, err ? [err] : [null]);
        });
      } else {
        fs.rmdir(dirPath, actualOptions, (err) => {
          this.executeCallback(actualCallback, err ? [err] : [null]);
        });
      }
      return null;
    } else {
      try {
        if (fs.rmSync) {
          fs.rmSync(dirPath, actualOptions);
        } else {
          fs.rmdirSync(dirPath, actualOptions);
        }
        return null;
      } catch (error: any) {
        throw this.throwErrorFormatters(error);
      }
    }
  }
}

class Stat extends FSMethodBuilder {
  override call() {
    const [filePath, options, callback] = this.args;
    this.validatePath(filePath);

    const hasCallback = callback !== undefined;
    const actualOptions = hasCallback ? options : {};
    const actualCallback = hasCallback ? callback : options;

    if (actualCallback && isTypeArgs(actualCallback) === "function") {
      fs.stat(filePath, actualOptions, (err, stats) => {
        if (err) {
          this.executeCallback(actualCallback, [err]);
          return;
        }

        const statsObject = this.__createStatsObject(stats);
        this.executeCallback(actualCallback, [null, statsObject]);
      });
      return null;
    } else {
      try {
        const stats = fs.statSync(filePath, actualOptions);
        return this.__createStatsObject(stats);
      } catch (error: any) {
        throw this.throwErrorFormatters(error);
      }
    }
  }

  __createStatsObject(stats: fs.Stats) {
    return {
      isFile: class extends FSMethodBuilder {
        override call() {
          return stats.isFile();
        }
      },
      isDirectory: class extends FSMethodBuilder {
        override call() {
          return stats.isDirectory();
        }
      },
      isSymbolicLink: class extends FSMethodBuilder {
        override call() {
          return stats.isSymbolicLink();
        }
      },
      size: class extends FSMethodBuilder {
        override call() {
          return stats.size;
        }
      },
      mtime: class extends FSMethodBuilder {
        override call() {
          return stats.mtime;
        }
      },
      ctime: class extends FSMethodBuilder {
        override call() {
          return stats.ctime;
        }
      },
      atime: class extends FSMethodBuilder {
        override call() {
          return stats.atime;
        }
      },
      birthtime: class extends FSMethodBuilder {
        override call() {
          return stats.birthtime;
        }
      },
      mode: class extends FSMethodBuilder {
        override call() {
          return stats.mode;
        }
      },
      uid: class extends FSMethodBuilder {
        override call() {
          return stats.uid;
        }
      },
      gid: class extends FSMethodBuilder {
        override call() {
          return stats.gid;
        }
      },
      [Environment.SymbolFormatedText]: `Stats { size: ${stats.size}, isFile: ${stats.isFile()}, isDirectory: ${stats.isDirectory()} }`,
    };
  }
}

class LStat extends FSMethodBuilder {
  override call() {
    const [filePath, options, callback] = this.args;
    this.validatePath(filePath);

    const hasCallback = callback !== undefined;
    const actualOptions = hasCallback ? options : {};
    const actualCallback = hasCallback ? callback : options;

    if (actualCallback && isTypeArgs(actualCallback) === "function") {
      fs.lstat(filePath, actualOptions, (err, stats) => {
        if (err) {
          this.executeCallback(actualCallback, [err]);
          return;
        }

        const statsObject = new Stat([filePath], [], this.environment).__createStatsObject(stats);
        this.executeCallback(actualCallback, [null, statsObject]);
      });
      return null;
    } else {
      try {
        const stats = fs.lstatSync(filePath, actualOptions);
        return new Stat([filePath], [], this.environment).__createStatsObject(stats);
      } catch (error: any) {
        throw this.throwErrorFormatters(error);
      }
    }
  }
}

class Unlink extends FSMethodBuilder {
  override call() {
    const [filePath, callback] = this.args;
    this.validatePath(filePath);

    if (callback && isTypeArgs(callback) === "function") {
      fs.unlink(filePath, (err) => {
        this.executeCallback(callback, err ? [err] : [null]);
      });
      return null;
    } else {
      try {
        fs.unlinkSync(filePath);
        return null;
      } catch (error: any) {
        throw this.throwErrorFormatters(error);
      }
    }
  }
}

class Rename extends FSMethodBuilder {
  override call() {
    const [oldPath, newPath, callback] = this.args;
    this.validatePath(oldPath, "oldPath");
    this.validatePath(newPath, "newPath");

    if (callback && isTypeArgs(callback) === "function") {
      fs.rename(oldPath, newPath, (err) => {
        this.executeCallback(callback, err ? [err] : [null]);
      });
      return null;
    } else {
      try {
        fs.renameSync(oldPath, newPath);
        return null;
      } catch (error: any) {
        throw this.throwErrorFormatters(error);
      }
    }
  }
}

class CopyFile extends FSMethodBuilder {
  override call() {
    const [src, dest, flags, callback] = this.args;
    this.validatePath(src, "src");
    this.validatePath(dest, "dest");

    const hasCallback = callback !== undefined;
    const actualFlags = hasCallback ? flags : 0;
    const actualCallback = hasCallback ? callback : flags;

    if (actualCallback && isTypeArgs(actualCallback) === "function") {
      fs.copyFile(src, dest, actualFlags, (err) => {
        this.executeCallback(actualCallback, err ? [err] : [null]);
      });
      return null;
    } else {
      try {
        fs.copyFileSync(src, dest, actualFlags);
        return null;
      } catch (error: any) {
        throw this.throwErrorFormatters(error);
      }
    }
  }
}

class Access extends FSMethodBuilder {
  override call() {
    const [filePath, mode, callback] = this.args;
    this.validatePath(filePath);

    const hasCallback = callback !== undefined;
    const actualMode = hasCallback ? mode : fs.constants.F_OK;
    const actualCallback = hasCallback ? callback : mode;

    if (actualCallback && isTypeArgs(actualCallback) === "function") {
      fs.access(filePath, actualMode, (err) => {
        this.executeCallback(actualCallback, err ? [err] : [null]);
      });
      return null;
    } else {
      try {
        fs.accessSync(filePath, actualMode);
        return null;
      } catch (error: any) {
        throw this.throwErrorFormatters(error);
      }
    }
  }
}

class Chmod extends FSMethodBuilder {
  override call() {
    const [filePath, mode, callback] = this.args;
    this.validatePath(filePath);
    this.validateNumber(mode, "mode");

    if (callback && isTypeArgs(callback) === "function") {
      fs.chmod(filePath, mode, (err) => {
        this.executeCallback(callback, err ? [err] : [null]);
      });
      return null;
    } else {
      try {
        fs.chmodSync(filePath, mode);
        return null;
      } catch (error: any) {
        throw this.throwErrorFormatters(error);
      }
    }
  }
}

class Chown extends FSMethodBuilder {
  override call() {
    const [filePath, uid, gid, callback] = this.args;
    this.validatePath(filePath);
    this.validateNumber(uid, "uid");
    this.validateNumber(gid, "gid");

    if (callback && isTypeArgs(callback) === "function") {
      fs.chown(filePath, uid, gid, (err) => {
        this.executeCallback(callback, err ? [err] : [null]);
      });
      return null;
    } else {
      try {
        fs.chownSync(filePath, uid, gid);
        return null;
      } catch (error: any) {
        throw this.throwErrorFormatters(error);
      }
    }
  }
}

class Symlink extends FSMethodBuilder {
  override call() {
    const [target, linkPath, type, callback] = this.args;
    this.validatePath(target, "target");
    this.validatePath(linkPath, "linkPath");

    const hasCallback = callback !== undefined;
    const actualType = hasCallback ? type : "file";
    const actualCallback = hasCallback ? callback : type;

    if (actualCallback && isTypeArgs(actualCallback) === "function") {
      fs.symlink(target, linkPath, actualType, (err) => {
        this.executeCallback(actualCallback, err ? [err] : [null]);
      });
      return null;
    } else {
      try {
        fs.symlinkSync(target, linkPath, actualType);
        return null;
      } catch (error: any) {
        throw this.throwErrorFormatters(error);
      }
    }
  }
}

class ReadLink extends FSMethodBuilder {
  override call() {
    const [linkPath, options, callback] = this.args;
    this.validatePath(linkPath);

    const hasCallback = callback !== undefined;
    const actualOptions = hasCallback ? options : {};
    const actualCallback = hasCallback ? callback : options;

    if (actualCallback && isTypeArgs(actualCallback) === "function") {
      fs.readlink(linkPath, actualOptions, (err, linkString) => {
        const callbackArgs = err ? [err] : [null, linkString];
        this.executeCallback(actualCallback, callbackArgs);
      });
      return null;
    } else {
      try {
        return fs.readlinkSync(linkPath, actualOptions);
      } catch (error: any) {
        throw this.throwErrorFormatters(error);
      }
    }
  }
}

class RealPath extends FSMethodBuilder {
  override call() {
    const [filePath, options, callback] = this.args;
    this.validatePath(filePath);

    const hasCallback = callback !== undefined;
    const actualOptions = hasCallback ? options : {};
    const actualCallback = hasCallback ? callback : options;

    if (actualCallback && isTypeArgs(actualCallback) === "function") {
      fs.realpath(filePath, actualOptions, (err, resolvedPath) => {
        const callbackArgs = err ? [err] : [null, resolvedPath];
        this.executeCallback(actualCallback, callbackArgs);
      });
      return null;
    } else {
      try {
        return fs.realpathSync(filePath, actualOptions);
      } catch (error: any) {
        throw this.throwErrorFormatters(error);
      }
    }
  }
}

class Truncate extends FSMethodBuilder {
  override call() {
    const [filePath, len, callback] = this.args;
    this.validatePath(filePath);

    const hasCallback = callback !== undefined;
    const actualLen = hasCallback ? len : 0;
    const actualCallback = hasCallback ? callback : len;

    if (actualCallback && isTypeArgs(actualCallback) === "function") {
      fs.truncate(filePath, actualLen, (err) => {
        this.executeCallback(actualCallback, err ? [err] : [null]);
      });
      return null;
    } else {
      try {
        fs.truncateSync(filePath, actualLen);
        return null;
      } catch (error: any) {
        throw this.throwErrorFormatters(error);
      }
    }
  }
}

class Exists extends FSMethodBuilder {
  override call() {
    const [filePath, callback] = this.args;
    this.validatePath(filePath);

    if (callback && isTypeArgs(callback) === "function") {
      fs.access(filePath, fs.constants.F_OK, (err) => {
        this.executeCallback(callback, [!err]);
      });
      return null;
    } else {
      try {
        fs.accessSync(filePath, fs.constants.F_OK);
        return true;
      } catch {
        return false;
      }
    }
  }
}

class FSWatcher extends FSMethodBuilder {
  override call() {
    const [filename, options, listener] = this.args;
    this.validatePath(filename);

    const hasListener = listener !== undefined;
    const actualOptions = hasListener ? options : {};
    const actualListener = hasListener ? listener : options;

    let watcher: fs.FSWatcher;

    try {
      watcher = fs.watch(filename, actualOptions);

      if (actualListener && isTypeArgs(actualListener) === "function") {
        watcher.on("change", (eventType, filename) => {
          this.executeCallback(actualListener, [eventType, filename]);
        });
      }
    } catch (error: any) {
      throw this.throwErrorFormatters(error);
    }

    return {
      on: class extends FSMethodBuilder {
        override call() {
          const [event, handler] = this.args;
          this.validateFunction(handler, "handler");

          const wrappedHandler = (...args: any[]) => {
            this.executeCallback(handler, args);
          };

          watcher.on(event, wrappedHandler);
          return null;
        }
      },

      once: class extends FSMethodBuilder {
        override call() {
          const [event, handler] = this.args;
          this.validateFunction(handler, "handler");

          const wrappedHandler = (...args: any[]) => {
            this.executeCallback(handler, args);
          };

          watcher.once(event, wrappedHandler);
          return null;
        }
      },

      close: class extends FSMethodBuilder {
        override call() {
          watcher.close();
          return null;
        }
      },

      ref: class extends FSMethodBuilder {
        override call() {
          watcher.ref();
          return null;
        }
      },

      unref: class extends FSMethodBuilder {
        override call() {
          watcher.unref();
          return null;
        }
      },

      [Environment.SymbolFormatedText]: `FSWatcher { filename: "${filename}" }`,
    };
  }
}

class WatchFile extends FSMethodBuilder {
  override call() {
    const [filename, options, listener] = this.args;
    this.validatePath(filename);

    const hasListener = listener !== undefined;
    const actualOptions = hasListener ? options : { persistent: true, interval: 5007 };
    const actualListener = hasListener ? listener : options;

    if (actualListener && isTypeArgs(actualListener) === "function") {
      const wrappedListener = (curr: fs.Stats, prev: fs.Stats) => {
        const currStats = new Stat([filename], [], this.environment).__createStatsObject(curr);
        const prevStats = new Stat([filename], [], this.environment).__createStatsObject(prev);
        this.executeCallback(actualListener, [currStats, prevStats]);
      };

      fs.watchFile(filename, actualOptions, wrappedListener);
    }

    return null;
  }
}

class Open extends FSMethodBuilder {
  override call() {
    const [filePath, flags, mode, callback] = this.args;
    this.validatePath(filePath);

    const hasCallback = callback !== undefined;
    const actualMode = hasCallback ? mode : 0o666;
    const actualCallback = hasCallback ? callback : mode;

    if (actualCallback && isTypeArgs(actualCallback) === "function") {
      fs.open(filePath, flags, actualMode, (err, fd) => {
        const callbackArgs = err ? [err] : [null, fd];
        this.executeCallback(actualCallback, callbackArgs);
      });
      return null;
    } else {
      try {
        return fs.openSync(filePath, flags, actualMode);
      } catch (error: any) {
        throw this.throwErrorFormatters(error);
      }
    }
  }
}

class Close extends FSMethodBuilder {
  override call() {
    const [fd, callback] = this.args;
    this.validateNumber(fd, "fd");

    if (callback && isTypeArgs(callback) === "function") {
      fs.close(fd, (err) => {
        this.executeCallback(callback, err ? [err] : [null]);
      });
      return null;
    } else {
      try {
        fs.closeSync(fd);
        return null;
      } catch (error: any) {
        throw this.throwErrorFormatters(error);
      }
    }
  }
}

class Read extends FSMethodBuilder {
  override call() {
    const [fd, buffer, offset, length, position, callback] = this.args;
    this.validateNumber(fd, "fd");

    if (callback && isTypeArgs(callback) === "function") {
      fs.read(fd, buffer, offset, length, position, (err, bytesRead, buffer) => {
        if (err) {
          this.executeCallback(callback, [err]);
        } else {
          this.executeCallback(callback, [
            null,
            bytesRead,
            new Bytes([buffer], [], this.environment).call(),
          ]);
        }
      });
      return null;
    } else {
      try {
        const result = fs.readSync(fd, buffer, offset, length, position);
        return {
          bytesRead: result,
          buffer: new Bytes([buffer], [], this.environment).call(),
        };
      } catch (error: any) {
        throw this.throwErrorFormatters(error);
      }
    }
  }
}

class Write extends FSMethodBuilder {
  override call() {
    const [fd, buffer, offset, length, position, callback] = this.args;
    this.validateNumber(fd, "fd");
    this.validateBuffer(buffer);

    const processedBuffer = this.processBuffer(buffer) as Buffer;

    if (callback && isTypeArgs(callback) === "function") {
      fs.write(fd, processedBuffer, offset, length, position, (err, written, buffer) => {
        if (err) {
          this.executeCallback(callback, [err]);
        } else {
          this.executeCallback(callback, [
            null,
            written,
            new Bytes([buffer], [], this.environment).call(),
          ]);
        }
      });
      return null;
    } else {
      try {
        const written = fs.writeSync(fd, processedBuffer, offset, length, position);
        return written;
      } catch (error: any) {
        throw this.throwErrorFormatters(error);
      }
    }
  }
}

class FStat extends FSMethodBuilder {
  override call() {
    const [fd, options, callback] = this.args;
    this.validateNumber(fd, "fd");

    const hasCallback = callback !== undefined;
    const actualOptions = hasCallback ? options : {};
    const actualCallback = hasCallback ? callback : options;

    if (actualCallback && isTypeArgs(actualCallback) === "function") {
      fs.fstat(fd, actualOptions, (err, stats) => {
        if (err) {
          this.executeCallback(actualCallback, [err]);
        } else {
          const statsObject = new Stat([""], [], this.environment).__createStatsObject(stats);
          this.executeCallback(actualCallback, [null, statsObject]);
        }
      });
      return null;
    } else {
      try {
        const stats = fs.fstatSync(fd, actualOptions);
        return new Stat([""], [], this.environment).__createStatsObject(stats);
      } catch (error: any) {
        throw this.throwErrorFormatters(error);
      }
    }
  }
}

class FSUtils extends FSMethodBuilder {
  override call() {
    return {
      copyDir: class extends FSMethodBuilder {
        override async call() {
          const [src, dest, options = {}] = this.args;
          this.validatePath(src, "src");
          this.validatePath(dest, "dest");

          try {
            await this.copyDirRecursive(src, dest, options);
            return null;
          } catch (error: any) {
            throw this.throwErrorFormatters(error);
          }
        }

        private async copyDirRecursive(src: string, dest: string, options: any) {
          const srcStat = await fsAsync.stat(src);

          if (srcStat.isDirectory()) {
            try {
              await fsAsync.mkdir(dest, { recursive: true });
            } catch (err: any) {
              if (err.code !== "EEXIST") throw err;
            }

            const files = await fsAsync.readdir(src);
            await Promise.all(
              files.map((file) =>
                this.copyDirRecursive(path.join(src, file), path.join(dest, file), options),
              ),
            );
          } else {
            await fsAsync.copyFile(src, dest, options.flags || 0);
          }
        }
      },

      removeDir: class extends FSMethodBuilder {
        override async call() {
          const [dirPath, options = {}] = this.args;
          this.validatePath(dirPath);

          try {
            if (fs.rmSync) {
              fs.rmSync(dirPath, { recursive: true, force: true, ...options });
            } else {
              await this.removeDirRecursive(dirPath);
            }
            return null;
          } catch (error: any) {
            throw this.throwErrorFormatters(error);
          }
        }

        private async removeDirRecursive(dirPath: string) {
          const stat = await fsAsync.stat(dirPath);

          if (stat.isDirectory()) {
            const files = await fsAsync.readdir(dirPath);
            await Promise.all(
              files.map((file) => this.removeDirRecursive(path.join(dirPath, file))),
            );
            await fsAsync.rmdir(dirPath);
          } else {
            await fsAsync.unlink(dirPath);
          }
        }
      },

      ensureDir: class extends FSMethodBuilder {
        override async call() {
          const [dirPath, mode] = this.args;
          this.validatePath(dirPath);

          try {
            await fsAsync.mkdir(dirPath, { recursive: true, mode });
            return null;
          } catch (error: any) {
            throw this.throwErrorFormatters(error);
          }
        }
      },

      move: class extends FSMethodBuilder {
        override async call() {
          const [src, dest, options = {}] = this.args;
          this.validatePath(src, "src");
          this.validatePath(dest, "dest");

          try {
            try {
              await fsAsync.rename(src, dest);
              return null;
            } catch (err: any) {
              if (err.code === "EXDEV") {
                const srcStat = await fsAsync.stat(src);

                if (srcStat.isDirectory()) {
                  await new FSUtils([], [], this.environment)
                    .call()
                    .copyDir.prototype.call.apply(
                      { args: [src, dest, options], environment: this.environment },
                      [],
                    );
                  await new FSUtils([], [], this.environment)
                    .call()
                    .removeDir.prototype.call.apply(
                      { args: [src, options], environment: this.environment },
                      [],
                    );
                } else {
                  await fsAsync.copyFile(src, dest);
                  await fsAsync.unlink(src);
                }
                return null;
              }
              throw err;
            }
          } catch (error: any) {
            throw this.throwErrorFormatters(error);
          }
        }
      },

      getSize: class extends FSMethodBuilder {
        override async call() {
          const [filePath] = this.args;
          this.validatePath(filePath);

          try {
            const stats = await fsAsync.stat(filePath);
            return stats.size;
          } catch (error: any) {
            throw this.throwErrorFormatters(error);
          }
        }
      },

      isEmpty: class extends FSMethodBuilder {
        override async call() {
          const [dirPath] = this.args;
          this.validatePath(dirPath);

          try {
            const stats = await fsAsync.stat(dirPath);
            if (!stats.isDirectory()) {
              return false;
            }

            const files = await fsAsync.readdir(dirPath);
            return files.length === 0;
          } catch (error: any) {
            return false;
          }
        }
      },

      createTemp: class extends FSMethodBuilder {
        override call() {
          const [prefix = "tmp-", suffix = "", dir] = this.args;

          const tmpDir = dir || require("os").tmpdir();
          const tmpName = prefix + Math.random().toString(36).substring(2) + suffix;
          const tmpPath = path.join(tmpDir, tmpName);

          try {
            fs.writeFileSync(tmpPath, "");
            return tmpPath;
          } catch (error: any) {
            throw this.throwErrorFormatters(error);
          }
        }
      },

      walk: class extends FSMethodBuilder {
        override async call() {
          const [dirPath, callback, options = {}] = this.args;
          this.validatePath(dirPath);
          this.validateFunction(callback);

          try {
            await this.walkDir(dirPath, callback, options);
            return null;
          } catch (error: any) {
            throw this.throwErrorFormatters(error);
          }
        }

        private async walkDir(dirPath: string, callback: any, options: any) {
          const files = await fsAsync.readdir(dirPath);

          for (const file of files) {
            const fullPath = path.join(dirPath, file);
            const stats = await fsAsync.stat(fullPath);

            const continueWalk = await this.executeCallback(callback, [
              fullPath,
              new Stat([fullPath], [], this.environment).__createStatsObject(stats),
            ]);

            if (stats.isDirectory() && continueWalk !== false && !options.shallow) {
              await this.walkDir(fullPath, callback, options);
            }
          }
        }
      },
    };
  }
}

module.exports = {
  readFile: ReadFile,
  writeFile: WriteFile,
  appendFile: AppendFile,
  readdir: ReadDir,
  makedir: MakeDir,
  removedir: RemoveDir,
  stat: Stat,
  lstat: LStat,
  unlink: Unlink,
  rename: Rename,
  copyFile: CopyFile,
  access: Access,
  chmod: Chmod,
  chown: Chown,
  symlink: Symlink,
  readlink: ReadLink,
  realpath: RealPath,
  truncate: Truncate,
  exists: Exists,
  constants: {
    F_OK: fs.constants.F_OK,
    R_OK: fs.constants.R_OK,
    W_OK: fs.constants.W_OK,
    X_OK: fs.constants.X_OK,
    COPYFILE_EXCL: fs.constants.COPYFILE_EXCL,
    COPYFILE_FICLONE: fs.constants.COPYFILE_FICLONE,
    COPYFILE_FICLONE_FORCE: fs.constants.COPYFILE_FICLONE_FORCE,
  },
  Watcher: FSWatcher,
  WatchFile,
  open: Open,
  close: Close,
  read: Read,
  write: Write,
  FStat,
  FSUtils,
};
