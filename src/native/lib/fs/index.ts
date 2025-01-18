import fs, { type WriteFileOptions } from "node:fs";
import { BufferWrapper } from "../buffers/index";
import { isFunctionNode } from "../../utils";
import { type FunctionDeclaration } from "../../../ast/declaration/FunctionDeclaration";
import { type FunctionExpression } from "../../../ast/expression/FunctionExpression";

function FileSystem() {
  function validatePath(path: string): void {
    if (typeof path !== "string" || path.trim() === "") {
      throw `Invalid path: "${path}". Must be a non-empty string.`;
    }
  }

  function validateCallback(
    cb: FunctionDeclaration | FunctionExpression,
  ): void {
    if (!isFunctionNode(cb)) {
      throw "Invalid callback. Must be a FunctionDeclaration or FunctionExpression.";
    }
  }

  return {
    readFile([path, options, cb]: [
      string,
      { encoding?: string | null; flag?: string } | null | undefined,
      FunctionDeclaration | FunctionExpression,
    ]): void {
      validatePath(path);
      validateCallback(cb);
      const callback = (
        err: NodeJS.ErrnoException | null,
        data: Buffer | string,
      ) => cb.evaluate(cb.parentEnv).call([err, BufferWrapper([data])]);
      fs.readFile(path, (options || {}) as any, callback);
    },

    writeFile([path, data, options, cb]: [
      string,
      string | Buffer,
      (
        | { encoding?: string | null; mode?: string | number; flag?: string }
        | string
        | null
        | undefined
      ),
      FunctionDeclaration | FunctionExpression,
    ]): void {
      validatePath(path);
      validateCallback(cb);
      const callback = (err: NodeJS.ErrnoException | null) =>
        cb.evaluate(cb.parentEnv).call([err]);
      fs.writeFile(path, data, (options || {}) as WriteFileOptions, callback);
    },

    appendFile([path, data, options, cb]: [
      string,
      string | Buffer,
      (
        | { encoding?: string | null; mode?: string | number; flag?: string }
        | string
        | null
        | undefined
      ),
      FunctionDeclaration | FunctionExpression,
    ]): void {
      validatePath(path);
      validateCallback(cb);
      const callback = (err: NodeJS.ErrnoException | null) =>
        cb.evaluate(cb.parentEnv).call([err]);
      fs.appendFile(path, data, (options || {}) as WriteFileOptions, callback);
    },

    readdir([path, options, cb]: [
      string,
      (
        | { encoding?: string | null; withFileTypes?: boolean }
        | string
        | null
        | undefined
      ),
      FunctionDeclaration | FunctionExpression,
    ]): void {
      validatePath(path);
      validateCallback(cb);
      const callback = (
        err: NodeJS.ErrnoException | null,
        files: string[] | fs.Dirent[],
      ) => cb.evaluate(cb.parentEnv).call([err, files]);
      fs.readdir(path, (options || {}) as any, callback);
    },

    unlink([path, cb]: [
      string,
      FunctionDeclaration | FunctionExpression,
    ]): void {
      validatePath(path);
      validateCallback(cb);
      const callback = (err: NodeJS.ErrnoException | null) =>
        cb.evaluate(cb.parentEnv).call([err]);
      fs.unlink(path, callback);
    },

    stat([path, cb]: [string, FunctionDeclaration | FunctionExpression]): void {
      validatePath(path);
      validateCallback(cb);
      const callback = (err: NodeJS.ErrnoException | null, stats: fs.Stats) =>
        cb.evaluate(cb.parentEnv).call([err, stats]);
      fs.stat(path, callback);
    },

    rename([oldPath, newPath, cb]: [
      string,
      string,
      FunctionDeclaration | FunctionExpression,
    ]): void {
      validatePath(oldPath);
      validatePath(newPath);
      validateCallback(cb);
      const callback = (err: NodeJS.ErrnoException | null) =>
        cb.evaluate(cb.parentEnv).call([err]);
      fs.rename(oldPath, newPath, callback);
    },

    mkdir([path, options, cb]: [
      string,
      { recursive?: boolean; mode?: string | number } | null | undefined,
      FunctionDeclaration | FunctionExpression,
    ]): void {
      validatePath(path);
      validateCallback(cb);
      const callback = (err: NodeJS.ErrnoException | null) =>
        cb.evaluate(cb.parentEnv).call([err]);
      fs.mkdir(path, options || {}, callback);
    },

    rmdir([path, options, cb]: [
      string,
      { recursive?: boolean } | null | undefined,
      FunctionDeclaration | FunctionExpression,
    ]): void {
      validatePath(path);
      validateCallback(cb);
      const callback = (err: NodeJS.ErrnoException | null) =>
        cb.evaluate(cb.parentEnv).call([err]);
      fs.rmdir(path, options || {}, callback);
    },

    copyFile([src, dest, flags, cb]: [
      string,
      string,
      number | undefined,
      FunctionDeclaration | FunctionExpression,
    ]): void {
      validatePath(src);
      validatePath(dest);
      validateCallback(cb);
      const callback = (err: NodeJS.ErrnoException | null) =>
        cb.evaluate(cb.parentEnv).call([err]);
      fs.copyFile(src, dest, flags || 0, callback);
    },
  };
}

export { FileSystem };
