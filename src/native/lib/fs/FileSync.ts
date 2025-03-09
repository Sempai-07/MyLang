import { from } from "../buffers/index";
import fs, { type WriteFileOptions } from "node:fs";
import { BaseError, ArgumentsError } from "../../../errors/BaseError";

function FileSync() {
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

  return {
    read([path, options]: [
      string,
      { encoding?: string | null; flag?: string } | null,
    ]) {
      validateArgs([path], ["string"]);
      return handleError(() =>
        from([fs.readFileSync(path, options as unknown as WriteFileOptions)]),
      );
    },

    write([path, data, options]: [
      string,
      string | Buffer,
      WriteFileOptions | null,
    ]) {
      validateArgs([path], ["string"]);
      return handleError(() => fs.writeFileSync(path, data, options || {}));
    },

    append([path, data, options]: [
      string,
      string | Buffer,
      WriteFileOptions | null,
    ]) {
      validateArgs([path], ["string"]);
      return handleError(() => fs.appendFileSync(path, data, options || {}));
    },

    remove([path]: [string]) {
      validateArgs([path], ["string"]);
      return handleError(() => fs.unlinkSync(path));
    },

    stat([path]: [string]) {
      validateArgs([path], ["string"]);
      return handleError(() => fs.statSync(path));
    },

    rename([oldPath, newPath]: [string, string]) {
      validateArgs([oldPath, newPath], ["string", "string"]);
      return handleError(() => fs.renameSync(oldPath, newPath));
    },

    list([path, options]: [
      string,
      { encoding: BufferEncoding | null; withFileTypes?: boolean } | null,
    ]) {
      validateArgs([path], ["string"]);
      // @ts-ignore
      return handleError(() => fs.readdirSync(path, options || null));
    },

    mkdir([path, options]: [
      string,
      { recursive?: boolean; mode?: string | number } | null,
    ]) {
      validateArgs([path], ["string"]);
      return handleError(() => fs.mkdirSync(path, options || {}));
    },

    rmdir([path, options]: [string, { recursive?: boolean } | null]) {
      validateArgs([path], ["string"]);
      return handleError(() => fs.rmdirSync(path, options || {}));
    },

    copy([src, dest, flags]: [string, string, number | undefined]) {
      validateArgs([src, dest], ["string", "string"]);
      return handleError(() => fs.copyFileSync(src, dest, flags || 0));
    },
  };
}

export { FileSync };
