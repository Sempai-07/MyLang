import os from "node:os";
import { ArgumentsError } from "../../../errors/BaseError";

function ensureArgsCount(args: any[], count: number, message: string): void {
  if (args.length < count) {
    throw new ArgumentsError(message, [`mylang:os (${__filename})`]);
  }
}

function platform(): string {
  return process.platform;
}

function homedir(): string {
  return os.homedir();
}

function tmpdir(): string {
  return os.tmpdir();
}

function getEnv(args: any[]): string | undefined {
  ensureArgsCount(args, 1, "getEnv requires 1 argument: key.");
  const key = String(args[0]);
  return process.env[key];
}

function setEnv(args: any[]): void {
  ensureArgsCount(args, 2, "setEnv requires 2 arguments: key and value.");
  const [key, value] = [String(args[0]), String(args[1])];
  process.env[key] = value;
}

function cwd(): string {
  return process.cwd();
}

function userInfo(): {
  username: string;
  uid: number;
  gid: number;
  shell: string | null;
  homedir: string;
} {
  return os.userInfo();
}

function cpus(): {
  model: string;
  speed: number;
  times: { user: number; nice: number; sys: number; idle: number; irq: number };
}[] {
  return require("os").cpus();
}

function totalmem(): number {
  return os.totalmem();
}

function freemem(): number {
  return os.freemem();
}

function hostname(): string {
  return os.hostname();
}

function networkInterfaces() {
  return os.networkInterfaces();
}

const constants = {
  version: require("../../../../../package.json").version,
  versions: require("../../../../../package.json").dependencies,
  nodejs: {
    version: process.version,
    versions: process.versions,
    release: process.release,
  },
};

// @ts-expect-error
constants.__proto__ = null;

export {
  platform,
  homedir,
  tmpdir,
  getEnv,
  setEnv,
  cwd,
  userInfo,
  cpus,
  totalmem,
  freemem,
  hostname,
  networkInterfaces,
  constants,
};
