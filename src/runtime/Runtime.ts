import { CallStack } from "./CallStack";
import { BaseError } from "../errors/BaseError";
import { BreakStatement } from "../ast/statement/BreakStatement";
import { ReturnStatement } from "../ast/statement/ReturnStatement";
import { ContinueStatement } from "../ast/statement/ContinueStatement";

class Runtime {
  callStack: CallStack = new CallStack();
  private _functionCallPositionStack: Array<number> = [];
  private _lastFunctionExecutionResult: any = null;
  private _iterationCallPositionStack: Array<number> = [];
  private _isBreak = false;
  private _isReturn = false;
  private _isContinue = false;

  resume() {
    if (this.callStack.isEmpty()) {
      return null;
    }

    const { environment, statement } = this.callStack.peek();

    if (statement instanceof ContinueStatement) {
      this._isContinue = true;
    }

    const value = statement.evaluate(environment);
    if (statement instanceof ReturnStatement) {
      this._isReturn = true;
      this._lastFunctionExecutionResult = value;
      try {
        this.finishLastFunctionCall();
      } catch (e) {
        throw String(e);
      }
    }

    if (statement instanceof BreakStatement) {
      this._isBreak = true;
      try {
        this.finishLastIterationCall();
      } catch (e) {
        throw String(e);
      }
    }

    this.callStack.pop();

    return null;
  }

  getLastFunctionExecutionResult(): any {
    return this._lastFunctionExecutionResult;
  }

  resetLastFunctionExecutionResult() {
    this._isReturn = false;
    this._lastFunctionExecutionResult = null;
  }

  markFunctionCallPosition() {
    this._functionCallPositionStack.push(this.callStack.getCursor());
  }

  markIterationCallPosition() {
    this._iterationCallPositionStack.push(this.callStack.getCursor());
  }

  finishLastFunctionCall() {
    if (this._functionCallPositionStack.length == 0) {
      const environment =
        this.callStack.stacks[this.callStack.stacks.length - 1]?.environment
        // prettier-ignore
        // @ts-ignore
          .values[
          "import"
        ]?.paths ??
        this.callStack.stacks[this.callStack.stacks.length - 1]?.environment
        // prettier-ignore
        // @ts-ignore
          .parent
        // prettier-ignore
        // @ts-ignore
          ?.values[
          "import"
        ]?.paths ??
        [];

      throw new BaseError("return statement can only exit in function body", {
        files: environment,
      });
    }
    this._functionCallPositionStack.pop();
  }

  finishLastIterationCall() {
    const lastFunctionCall =
      this._functionCallPositionStack[
        this._functionCallPositionStack.length - 1
      ];
    const lastIterationCall =
      this._iterationCallPositionStack[
        this._iterationCallPositionStack.length - 1
      ];

    if (
      lastIterationCall === undefined ||
      lastIterationCall === undefined ||
      lastIterationCall < lastFunctionCall!
    ) {
      const environment =
        this.callStack.stacks[this.callStack.stacks.length - 1]?.environment
        // prettier-ignore
        // @ts-ignore
          .values[
          "import"
        ]?.paths ??
        this.callStack.stacks[this.callStack.stacks.length - 1]?.environment
        // prettier-ignore
        // @ts-ignore
          .parent
        // prettier-ignore
        // @ts-ignore
          ?.values[
          "import"
        ]?.paths ??
        [];
      throw new BaseError("break statement can only exist in iteration block", {
        files: environment,
      });
    }

    this._iterationCallPositionStack.pop();
  }

  get isBreak(): boolean {
    return this._isBreak;
  }

  get isReturn(): boolean {
    return this._isReturn;
  }

  get isContinue(): boolean {
    return this._isContinue;
  }

  resetIsBreak() {
    this._isBreak = false;
  }

  resetContinue() {
    this._isContinue = false;
  }
}

const runtime = new Runtime();

export { runtime };
