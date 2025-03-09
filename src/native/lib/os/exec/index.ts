import childProcess from "node:child_process";
import { from } from "../../buffers/index";
import { isFunctionNode } from "../../../utils";
import { BaseError, ArgumentsError } from "../../../../errors/BaseError";
import { emitWarning } from "../../../../errors/WarningError";

emitWarning('module "os/exec" is in an experimental state', {
  name: "ModuleExperimental",
  code: "WARN001",
});

function ensureArgsCount(args: any[], count: number, message: string): void {
  if (args.length < count) {
    throw new ArgumentsError(message, [`mylang:os/exec (${__filename})`]);
  }
}

function handleError(err: NodeJS.ErrnoException | null) {
  return err ? new BaseError(String(err), { files: [] }) : null;
}

function exec(args: any[]) {
  ensureArgsCount(args, 1, "requires at 1 argument.");
  const [command, options, callback] = args;

  if (options) {
    if (isFunctionNode(options) && !callback) {
      const callCallback = (...args: any[]) =>
        options.evaluate(options.parentEnv).call([
          { value: handleError(args[0]) },
          {
            value: typeof args[1] === "string" ? args[1] : from([args[1]]),
          },
          {
            value: typeof args[2] === "string" ? args[2] : from([args[2]]),
          },
        ]);

      childProcess.exec(command, callCallback);
      return;
    }
    if (isFunctionNode(callback)) {
      const callCallback = (...args: any[]) =>
        callback.evaluate(callback.parentEnv).call([
          { value: handleError(args[0]) },
          {
            value: typeof args[1] === "string" ? args[1] : from([args[1]]),
          },
          {
            value: typeof args[2] === "string" ? args[2] : from([args[2]]),
          },
        ]);

      childProcess.exec(command, options, callCallback);
      return;
    }
  }

  childProcess.exec(command);
  return;
}

function execSync(args: any[]) {
  ensureArgsCount(args, 1, "requires at 1 argument.");
  const [command, options] = args;
  const result = childProcess.execSync(command, options);
  return typeof result === "string" ? result : from([result]);
}

export { exec, execSync };
