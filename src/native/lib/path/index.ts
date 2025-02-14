import path from "node:path";
import { ArgumentsError } from "../../../errors/BaseError";

function ensureArgsCount(args: any[], count: number, message: string): void {
  if (args.length < count) {
    throw new ArgumentsError(message, [`mylang:path (${__filename})`]);
  }
}

function join(args: string[]): string {
  ensureArgsCount(args, 1, "join requires at least 1 argument: path segments.");
  return path.join(...args);
}

function basename(args: [string, string?]): string {
  ensureArgsCount(args, 1, "basename requires at least 1 argument: path.");
  return args[1] ? path.basename(args[0], args[1]) : path.basename(args[0]);
}

function extname(args: [string]): string {
  ensureArgsCount(args, 1, "extname requires at least 1 argument: path.");
  return path.extname(args[0]);
}

function dirname(args: [string]): string {
  ensureArgsCount(args, 1, "dirname requires at least 1 argument: path.");
  return path.dirname(args[0]);
}

function normalize(args: [string]): string {
  ensureArgsCount(args, 1, "normalize requires at least 1 argument: path.");
  return path.normalize(args[0]);
}

function resolve(args: [string, ...string[]]): string {
  ensureArgsCount(args, 1, "resolve requires at least 1 argument: path.");
  return path.resolve(...args);
}

function parse(args: [string]): {
  root: string;
  dir: string;
  base: string;
  ext: string;
  name: string;
} {
  ensureArgsCount(args, 1, "parse requires at least 1 argument: path.");
  return path.parse(args[0]);
}

function format(args: [path.FormatInputPathObject]): string {
  ensureArgsCount(args, 1, "format requires at least 1 argument: path object.");
  return path.format(args[0]);
}

function isAbsolute(args: [string]): boolean {
  ensureArgsCount(args, 1, "isAbsolute requires at least 1 argument: path.");
  return path.isAbsolute(args[0]);
}

function relative(args: [string, string]): string {
  ensureArgsCount(args, 2, "relative requires 2 arguments: from and to paths.");
  return path.relative(args[0], args[1]);
}

export {
  join,
  basename,
  extname,
  dirname,
  normalize,
  resolve,
  parse,
  format,
  isAbsolute,
  relative,
};
