import fs from "node:fs";
import { BufferWrapper } from "../buffers/index";
import { BaseError, ArgumentsError } from "../../../errors/BaseError";

function FileOperation() {
  let fd: number | null = null;
  let filePath: string | null = null;

  function validateArgs(args: any[], expectedTypes: string[]) {
    args.forEach((arg, index) => {
      if (typeof arg !== expectedTypes[index]) {
        throw new ArgumentsError(
          `Expected ${expectedTypes[index]}, got ${typeof arg}.`,
          [`mylang:fs (${__filename})`],
        );
      }
    });
  }

  function handleError<T>(fn: () => T): T {
    try {
      return fn();
    } catch (err) {
      throw new BaseError(String(err), {
        files: [`mylang:fs (${__filename})`],
      });
    }
  }

  function ensureOpen() {
    if (fd === null) {
      throw new BaseError("File is not open.", {
        files: [`mylang:fs (${__filename})`],
      });
    }
  }

  return {
    open([path, flags, mode]: [string, string, number?]) {
      validateArgs([path, flags], ["string", "string"]);
      filePath = path;
      fd = handleError(() => fs.openSync(path, flags, mode));
    },

    close() {
      if (fd !== null) {
        handleError(() => fs.closeSync(fd!));
        fd = null;
        filePath = null;
      }
    },

    write([data]: [string | Buffer]) {
      ensureOpen();
      handleError(() =>
        fs.writeSync(fd!, typeof data === "string" ? Buffer.from(data) : data),
      );
    },

    read([length, position]: [number, number?]) {
      ensureOpen();
      const buffer = Buffer.alloc(length);
      return handleError(() => {
        fs.readSync(fd!, buffer, 0, length, position!);
        return BufferWrapper([buffer]);
      });
    },

    fsync() {
      ensureOpen();
      handleError(() => fs.fsyncSync(fd!));
    },

    truncate([length]: [number]) {
      if (!filePath)
        throw new BaseError("File is not open.", {
          files: [`mylang:fs (${__filename})`],
        });
      handleError(() => fs.truncateSync(filePath!, length));
    },

    chmod([mode]: [string | number]) {
      if (!filePath)
        throw new BaseError("File is not open.", {
          files: [`mylang:fs (${__filename})`],
        });
      handleError(() => fs.chmodSync(filePath!, mode));
    },

    chown([uid, gid]: [number, number]) {
      if (!filePath)
        throw new BaseError("File is not open.", {
          files: [`mylang:fs (${__filename})`],
        });
      handleError(() => fs.chownSync(filePath!, uid, gid));
    },
  };
}

export { FileOperation };
