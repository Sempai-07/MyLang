import nodeProcess from "node:process";
import packageMyLang from "../../../package.json";
import { FunctionBuilder, FunctionBuilderCodeError } from "../../FunctionBuilder";
import { Environment } from "../../../src/Environment";
import { type StmtType } from "../../../src/ast/StmtType";
import { isTypeArgs } from "../../utils/utils";

abstract class ProcessMethodBuilder extends FunctionBuilder {
  constructor(args: any[], astArgs: StmtType[], environment: Environment) {
    super(args, astArgs, environment);
  }

  get pkgInfo() {
    return {
      name: "os/process",
      path: __dirname,
    };
  }

  protected validateString(str: any, argName: string = "string"): void {
    if (typeof str !== "string") {
      throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsTypeError, {
        propsName: argName,
        expectType: "string",
        received: typeof str,
      });
    }
  }

  protected validateNumber(num: any, argName: string = "number"): void {
    if (isTypeArgs(num) !== "int" && isTypeArgs(num) !== "float") {
      throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsTypeError, {
        propsName: argName,
        expectType: "number",
        received: isTypeArgs(num),
      });
    }
  }

  protected validateArray(arr: any, argName: string = "array"): void {
    if (isTypeArgs(arr) !== "array") {
      throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsTypeError, {
        propsName: argName,
        expectType: "array",
        received: isTypeArgs(arr),
      });
    }
  }

  protected validateObject(obj: any, argName: string = "object"): void {
    if (isTypeArgs(obj) !== "object") {
      throw this.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsTypeError, {
        propsName: argName,
        expectType: "object",
        received: isTypeArgs(obj),
      });
    }
  }

  call() {
    throw new Error("Call is not implemented");
  }
}

class GetPID extends ProcessMethodBuilder {
  override call() {
    return nodeProcess.pid;
  }
}

class GetPPID extends ProcessMethodBuilder {
  override call() {
    return nodeProcess.ppid;
  }
}

class GetArgv extends ProcessMethodBuilder {
  override call() {
    return nodeProcess.argv;
  }
}

class GetExecPath extends ProcessMethodBuilder {
  override call() {
    return nodeProcess.execPath;
  }
}

class GetCwd extends ProcessMethodBuilder {
  override call() {
    return nodeProcess.cwd();
  }
}

class ChangeCwd extends ProcessMethodBuilder {
  override call() {
    const [directory] = this.args;
    this.validateString(directory, "directory");

    try {
      nodeProcess.chdir(directory);
      return true;
    } catch (error: any) {
      throw this.throwErrorFormatters(new Error(`Failed to change directory: ${error.message}`));
    }
  }
}

class KillProcess extends ProcessMethodBuilder {
  override call() {
    const [pid, signal] = this.args;
    this.validateNumber(pid, "pid");

    const killSignal = signal !== undefined ? signal : "SIGTERM";
    this.validateString(killSignal, "signal");

    try {
      nodeProcess.kill(pid, killSignal);
      return true;
    } catch (error: any) {
      throw this.throwErrorFormatters(new Error(`Failed to kill process: ${error.message}`));
    }
  }
}

class GetUptime extends ProcessMethodBuilder {
  override call() {
    return nodeProcess.uptime();
  }
}

class GetMemoryUsage extends ProcessMethodBuilder {
  override call() {
    return nodeProcess.memoryUsage();
  }
}

class GetCpuUsage extends ProcessMethodBuilder {
  override call() {
    const [previousValue] = this.args;

    if (previousValue !== undefined) {
      this.validateObject(previousValue, "previousValue");
      return nodeProcess.cpuUsage(previousValue);
    }

    return nodeProcess.cpuUsage();
  }
}

class GetResourceUsage extends ProcessMethodBuilder {
  override call() {
    return nodeProcess.resourceUsage();
  }
}

class GetUid extends ProcessMethodBuilder {
  override call() {
    if (nodeProcess.getuid) {
      return nodeProcess.getuid();
    }
    return null;
  }
}

class GetGid extends ProcessMethodBuilder {
  override call() {
    if (nodeProcess.getgid) {
      return nodeProcess.getgid();
    }
    return null;
  }
}

class SetUid extends ProcessMethodBuilder {
  override call() {
    const [id] = this.args;
    this.validateNumber(id, "id");

    if (!nodeProcess.setuid) {
      throw this.throwErrorFormatters(new Error("setuid is not supported on this platform"));
    }

    try {
      nodeProcess.setuid(id);
      return true;
    } catch (error: any) {
      throw this.throwErrorFormatters(new Error(`Failed to set uid: ${error.message}`));
    }
  }
}

class SetGid extends ProcessMethodBuilder {
  override call() {
    const [id] = this.args;
    this.validateNumber(id, "id");

    if (!nodeProcess.setgid) {
      throw this.throwErrorFormatters(new Error("setgid is not supported on this platform"));
    }

    try {
      nodeProcess.setgid(id);
      return true;
    } catch (error: any) {
      throw this.throwErrorFormatters(new Error(`Failed to set gid: ${error.message}`));
    }
  }
}

class GetGroups extends ProcessMethodBuilder {
  override call() {
    if (nodeProcess.getgroups) {
      return nodeProcess.getgroups();
    }
    return [];
  }
}

class SetGroups extends ProcessMethodBuilder {
  override call() {
    const [groups] = this.args;
    this.validateArray(groups, "groups");

    if (!nodeProcess.setgroups) {
      throw this.throwErrorFormatters(new Error("setgroups is not supported on this platform"));
    }

    try {
      nodeProcess.setgroups(groups);
      return true;
    } catch (error: any) {
      throw this.throwErrorFormatters(new Error(`Failed to set groups: ${error.message}`));
    }
  }
}

class HrTime extends ProcessMethodBuilder {
  override call() {
    const [time] = this.args;

    if (time !== undefined) {
      this.validateArray(time, "time");
      return nodeProcess.hrtime(time);
    }

    return nodeProcess.hrtime();
  }
}

class HrTimeBigInt extends ProcessMethodBuilder {
  override call() {
    if (nodeProcess.hrtime.bigint) {
      return nodeProcess.hrtime.bigint();
    }

    const hrtime = nodeProcess.hrtime();
    return BigInt(hrtime[0]) * BigInt(1e9) + BigInt(hrtime[1]);
  }
}

const process = {
  version: packageMyLang.version,
  versions: packageMyLang.dependencies,
  arch: nodeProcess.arch,
  platform: nodeProcess.platform,
  nodejs: {
    version: nodeProcess.version,
    versions: nodeProcess.versions,
    release: nodeProcess.release,
    config: nodeProcess.config,
    env: nodeProcess.env,
  },
  getpid: GetPID,
  getppid: GetPPID,
  argv: GetArgv,
  getExecPath: GetExecPath,
  cwd: GetCwd,
  changecwd: ChangeCwd,
  killProcess: KillProcess,
  getUptime: GetUptime,
  getMemoryUsage: GetMemoryUsage,
  getCpuUsage: GetCpuUsage,
  getResourceUsage: GetResourceUsage,
  uid: GetUid,
  gid: GetGid,
  setUid: SetUid,
  setGid: SetGid,
  groups: GetGroups,
  setGroups: SetGroups,
  hrTime: HrTime,
  hrTimeBigInt: HrTimeBigInt,
};

module.exports = process;
