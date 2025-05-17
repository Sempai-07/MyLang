import { EventEmitter } from "node:events";
import { isFunctionNode } from "../../native/utils";
import { type FunctionDeclaration } from "../../ast/declaration/FunctionDeclaration";
import { type FunctionExpression } from "../../ast/expression/FunctionExpression";
import { PromiseCustom } from "../../native/lib/promises/symbol";
import { FunctionCallError } from "../../errors/BaseError";

class TaskCustom extends EventEmitter {
  private taskFn: () => any;
  private result: any = null;
  private isCompleted: boolean = false;
  private isRunning: boolean = false;
  private hasLogged: boolean = false;

  constructor(taskFn: () => Promise<any>) {
    super();

    this.taskFn = taskFn;
  }

  start() {
    if (this.isRunning) {
      throw new Error("Task is already running");
    }

    this.isRunning = true;

    try {
      this.result = this.taskFn();
      this.emit("data", this.result);
    } catch (err) {
      this.result = err;
      this.emit("error", err);
    } finally {
      this.isCompleted = true;
      this.emit("finally");
    }
  }

  getResult() {
    return this.isCompleted ? this.result : null;
  }

  isAlertRunning() {
    return this.isRunning;
  }

  isFinished() {
    return this.isCompleted;
  }

  logResult() {
    if (this.isFinished() && !this.hasLogged) {
      console.log("Task finished with result:", this.getResult());
      this.hasLogged = true;
    }
  }
}

class Task {
  [PromiseCustom]: TaskCustom;

  constructor(taskFn: () => any) {
    this[PromiseCustom] = new TaskCustom(taskFn);

    this.then = this.then.bind(this);
    this.catch = this.catch.bind(this);
    this.finally = this.finally.bind(this);
  }

  then([cb]: [FunctionDeclaration | FunctionExpression]) {
    if (!isFunctionNode(cb)) {
      throw new FunctionCallError("Invalid callback function.", []);
    }

    this[PromiseCustom].on("data", (data) => {
      if (data instanceof Task) {
        data[PromiseCustom].on("data", (data) => {
          cb.call([{ value: data }]);
        });
        return;
      }
      cb.call([{ value: data }]);
    });

    return new Task(() => this[PromiseCustom].getResult());
  }

  catch([cb]: [FunctionDeclaration | FunctionExpression]) {
    if (!isFunctionNode(cb)) {
      throw new FunctionCallError("Invalid callback function.", []);
    }

    this[PromiseCustom].on("data", (data) => {
      if (data instanceof Task) {
        data[PromiseCustom].on("error", (err) => {
          cb.call([{ value: err }]);
        });
        return;
      }
    });

    this[PromiseCustom].on("error", (err) => {
      if (err instanceof Task) {
        err[PromiseCustom].on("error", (err) => {
          cb.call([{ value: err }]);
        });
        return;
      }
      cb.call([{ value: err }]);
    });

    return new Task(() => this[PromiseCustom].getResult());
  }

  finally([cb]: [FunctionDeclaration | FunctionExpression]) {
    if (!isFunctionNode(cb)) {
      throw new FunctionCallError("Invalid callback function.", []);
    }

    this[PromiseCustom].on("finally", () => cb.call([]));

    return new Task(() => this[PromiseCustom].getResult());
  }
}

export { Task };
