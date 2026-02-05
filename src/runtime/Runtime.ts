import { CallStack } from "./CallStack";
import { BaseError } from "../errors/BaseError";
import { BreakStatement } from "../ast/statement/BreakStatement";
import { ReturnStatement } from "../ast/statement/ReturnStatement";
import { ForStatement } from "../ast/statement/ForStatement";
import { ContinueStatement } from "../ast/statement/ContinueStatement";
import { Scheduler } from "./Scheduler";

class Runtime {
  callStack: CallStack = new CallStack();
  schedulerStack: Scheduler = new Scheduler();
  spawnQueue: Map<string, any> = new Map();
  private _isBreak = false;
  private _isReturn = false;
  private _isContinue = false;
  private functionStack: number[] = [];
  private iterationStack: number[] = [];
  private _lastExecutionResult: any = null;

  async resume() {
    if (this.callStack.isEmpty()) {
      return null;
    }

    const { environment, statement } = this.callStack.peek();

    if (statement instanceof ReturnStatement && this.functionStack.length === 0) {
      throw new BaseError("return statement can only exit in function body", {
        files: this.getFilePaths(environment),
      });
    }

    if (
      (statement instanceof BreakStatement || statement instanceof ContinueStatement) &&
      !this.isInValidIteration()
    ) {
      const statementType = statement instanceof BreakStatement ? "break" : "continue";
      throw new BaseError(`${statementType} statement can only exist in iteration block`, {
        files: this.getFilePaths(environment),
      });
    }
    

    const value = await statement.evaluate(environment);
    
    if (statement instanceof ReturnStatement) {
      this._isReturn = true;
      this._lastExecutionResult = value;
    }

    if (statement instanceof BreakStatement) {
      this._isBreak = true;
    }

    if (statement instanceof ContinueStatement) {
      this._isContinue = true;
    }

    this.callStack.pop();

    return value;
  }

  get isBreak() {
    return this._isBreak;
  }

  get isContinue() {
    return this._isContinue;
  }

  get isReturn() {
    return this._isReturn;
  }

  markFunctionCallPosition() {
    this.functionStack.push(this.callStack.getCursor());
  }

  markIterationCallPosition() {
    this.iterationStack.push(this.callStack.getCursor());
  }

  finishIteration() {
    if (this.iterationStack.length > 0) {
      this.iterationStack.pop();
    }
  }

  finishFunction() {
    if (this.functionStack.length > 0) {
      this.functionStack.pop();
    }
  }

  getLastExecutionResult(): any {
    return this._lastExecutionResult;
  }

  resetLastExecutionResult() {
    this._isReturn = false;
    this._lastExecutionResult = null;
  }

  resetBreak() {
    this._isBreak = false;
  }

  resetContinue() {
    this._isContinue = false;
  }

  resetAll() {
    this._isBreak = false;
    this._isReturn = false;
    this._isContinue = false;
    this._lastExecutionResult = null;
  }

  private isInValidIteration(): boolean {
    if (this.iterationStack.length === 0) {
      return false;
    }

    if (this.functionStack.length === 0) {
      return true;
    }

    const lastFunction = this.functionStack[this.functionStack.length - 1]!;
    const lastIteration = this.iterationStack[this.iterationStack.length - 1]!;

    return lastIteration > lastFunction;
  }

  private getFilePaths(environment: any): string[] {
    try {
      // @ts-ignore
      return (
        environment?.values?.["import"]?.paths ||
        // @ts-ignore
        environment?.parent?.values?.["import"]?.paths ||
        []
      );
    } catch {
      return [];
    }
  }
}

const runtime = new Runtime();

export { runtime };
