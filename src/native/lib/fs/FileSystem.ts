import { from } from "../buffers/index";
import fs, { type WriteFileOptions } from "node:fs";
import { isFunctionNode } from "../../utils";
import { type FunctionDeclaration } from "../../../ast/declaration/FunctionDeclaration";
import { type FunctionExpression } from "../../../ast/expression/FunctionExpression";
import {
  BaseError,
  ArgumentsError,
  FunctionCallError,
} from "../../../errors/BaseError";

function FileSystem() {
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

  function validateCallback(cb: FunctionDeclaration | FunctionExpression) {
    if (!isFunctionNode(cb)) {
      throw new FunctionCallError("Invalid callback function.", [
        `mylang:fs (${__filename})`,
      ]);
    }
  }

  function handleError(err: NodeJS.ErrnoException | null) {
    return err
      ? new BaseError(String(err), { files: [`mylang:fs (${__filename})`] })
      : null;
  }

  return {
    read([path, options, cb]: [
      string,
      { encoding?: string | null; flag?: string } | null,
      FunctionDeclaration | FunctionExpression,
    ]) {
      validateArgs([path], ["string"]);
      validateCallback(cb);
      // @ts-ignore
      fs.readFile(path, options || {}, (err, data) =>
        cb
          .evaluate(cb.parentEnv)
          .call([{ value: handleError(err) }, { value: from([data]) }]),
      );
    },

    write([path, data, options, cb]: [
      string,
      string | Buffer,
      WriteFileOptions | null,
      FunctionDeclaration | FunctionExpression,
    ]) {
      validateArgs([path], ["string"]);
      validateCallback(cb);
      fs.writeFile(path, data, options || {}, (err) =>
        cb.evaluate(cb.parentEnv).call([{ value: handleError(err) }]),
      );
    },

    append([path, data, options, cb]: [
      string,
      string | Buffer,
      WriteFileOptions | null,
      FunctionDeclaration | FunctionExpression,
    ]) {
      validateArgs([path], ["string"]);
      validateCallback(cb);
      fs.appendFile(path, data, options || {}, (err) =>
        cb.evaluate(cb.parentEnv).call([{ value: handleError(err) }]),
      );
    },

    remove([path, cb]: [string, FunctionDeclaration | FunctionExpression]) {
      validateArgs([path], ["string"]);
      validateCallback(cb);
      fs.unlink(path, (err) =>
        cb.evaluate(cb.parentEnv).call([{ value: handleError(err) }]),
      );
    },

    stat([path, cb]: [string, FunctionDeclaration | FunctionExpression]) {
      validateArgs([path], ["string"]);
      validateCallback(cb);
      fs.stat(path, (err, stats) =>
        cb
          .evaluate(cb.parentEnv)
          .call([{ value: handleError(err) }, { value: stats }]),
      );
    },

    rename([oldPath, newPath, cb]: [
      string,
      string,
      FunctionDeclaration | FunctionExpression,
    ]) {
      validateArgs([oldPath, newPath], ["string", "string"]);
      validateCallback(cb);
      fs.rename(oldPath, newPath, (err) =>
        cb.evaluate(cb.parentEnv).call([{ value: handleError(err) }]),
      );
    },
  };
}

export { FileSystem };
