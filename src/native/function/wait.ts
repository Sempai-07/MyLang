import { Spawn } from "../../runtime/Spawn";
import { Environment } from "../../Environment";
import { type StmtType } from "../../ast/StmtType";
import { BaseError } from "../../errors/BaseError";
import { FunctionBuilder } from "../../../library/FunctionBuilder";
import { SpawnQueueError, SpawnQueueCodeError } from "../../errors/runtime/SpawnQueueError";

class allWait extends FunctionBuilder {
  constructor(args: any[], astArgs: StmtType[], environment: Environment) {
    super(args, astArgs, environment);
  }

  get pkgInfo() {
    return {
      name: "wait",
      path: __dirname,
    };
  }

  async call() {
    let spawnTasks: any[] = [];

    // wait.all(task1, task2, task3) или wait.all([task1, task2, task3])
    if (this.args.length === 1 && Array.isArray(this.args[0])) {
      spawnTasks = this.args[0];
    } else {
      spawnTasks = this.args;
    }

    const spawnHandlers: Spawn<any>[] = [];

    for (let i = 0; i < spawnTasks.length; i++) {
      const spawnHandler = spawnTasks[i]?.[Environment.SpawnQueueSymbol];

      if (!(spawnHandler instanceof Spawn)) {
        throw new SpawnQueueError(SpawnQueueCodeError.ValueIsNotSpawn);
      }

      await spawnHandler.promise;

      if (spawnHandler.error) {
        await Promise.all(
          spawnTasks.slice(i).map((spawn) => spawn[Environment.SpawnQueueSymbol].cancel()),
        );
        (spawnHandler.error as any).cause = { index: i };
        (spawnHandler.error as any).message += ` (index ${i})`;
        throw spawnHandler.error;
      }

      spawnHandlers.push(spawnHandler.result);
    }

    return spawnHandlers;
  }
}

class raceWait extends FunctionBuilder {
  constructor(args: any[], astArgs: StmtType[], environment: Environment) {
    super(args, astArgs, environment);
  }

  get pkgInfo() {
    return {
      name: "wait",
      path: __dirname,
    };
  }

  async call() {
    let spawnTasks: any[] = [];

    if (this.args.length === 1 && Array.isArray(this.args[0])) {
      spawnTasks = this.args[0];
    } else {
      spawnTasks = this.args;
    }

    const spawnHandlers: Promise<any>[] = [];

    for (let i = 0; i < spawnTasks.length; i++) {
      const spawnHandler = spawnTasks[i]?.[Environment.SpawnQueueSymbol];

      if (!(spawnHandler instanceof Spawn)) {
        throw new SpawnQueueError(SpawnQueueCodeError.ValueIsNotSpawn);
      }

      spawnHandlers.push(spawnHandler.promise);
    }

    return new Promise(async (resolve, reject) => {
      const result = await Promise.race(spawnHandlers);
      if (result instanceof Error) {
        reject(result);
      }
      return resolve(result);
    });
  }
}

class allSettledWait extends FunctionBuilder {
  constructor(args: any[], astArgs: StmtType[], environment: Environment) {
    super(args, astArgs, environment);
  }

  get pkgInfo() {
    return {
      name: "wait",
      path: __dirname,
    };
  }

  async call() {
    let spawnTasks: any[] = [];

    if (this.args.length === 1 && Array.isArray(this.args[0])) {
      spawnTasks = this.args[0];
    } else {
      spawnTasks = this.args;
    }

    const spawnHandlers: {
      status: "fulfilled" | "rejected" | "pending" | "cancelled";
      reason?: string;
      value?: any;
    }[] = [];

    for (let i = 0; i < spawnTasks.length; i++) {
      const spawnHandler = spawnTasks[i]?.[Environment.SpawnQueueSymbol];

      if (!(spawnHandler instanceof Spawn)) {
        throw new SpawnQueueError(SpawnQueueCodeError.ValueIsNotSpawn);
      }

      await spawnHandler.promise;

      if (spawnHandler.error) {
        spawnHandlers.push({
          status: spawnHandler.status,
          reason: (spawnHandler.error as Error).message,
        });
        continue;
      }

      spawnHandlers.push({ status: spawnHandler.status, value: spawnHandler.result });
    }

    return spawnHandlers;
  }
}

class anyWait extends FunctionBuilder {
  constructor(args: any[], astArgs: StmtType[], environment: Environment) {
    super(args, astArgs, environment);
  }

  get pkgInfo() {
    return {
      name: "wait",
      path: __dirname,
    };
  }

  async call() {
    let spawnTasks: any[] = [];

    if (this.args.length === 1 && Array.isArray(this.args[0])) {
      spawnTasks = this.args[0];
    } else {
      spawnTasks = this.args;
    }

    const spawnHandlers: Promise<any>[] = [];

    for (let i = 0; i < spawnTasks.length; i++) {
      const spawnHandler = spawnTasks[i]?.[Environment.SpawnQueueSymbol];

      if (!(spawnHandler instanceof Spawn)) {
        throw new SpawnQueueError(SpawnQueueCodeError.ValueIsNotSpawn);
      }

      spawnHandlers.push(
        spawnHandler.promise.then(async (result) => {
          return new Promise((resolve, reject) => {
            if (result instanceof Error) reject(result);
            return resolve(result);
          });
        }),
      );
    }

    return Promise.any(spawnHandlers).catch(async (error) => {
      throw super.throwErrorFormatters(new BaseError(error.message));
    });
  }
}

export { allWait, raceWait, allSettledWait, anyWait };
