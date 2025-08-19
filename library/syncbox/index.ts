import { FunctionBuilder, FunctionBuilderCodeError } from "../FunctionBuilder";
import { Environment } from "../../src/Environment";
import { type StmtType } from "../../src/ast/StmtType";
import { FunctionDeclaration } from "../../src/ast/declaration/FunctionDeclaration";
import { FunctionExpression } from "../../src/ast/expression/FunctionExpression";
import { isTypeArgs } from "../utils/utils";
import { isSubclassOfByName } from "../../src/utils/isSubclassOfByName";
import { runtime } from "../../src/runtime/Runtime";
import { Channel } from "./Channel";

class Chan extends FunctionBuilder {
  constructor(args: any[], astArgs: StmtType[], environment: Environment) {
    super(args, astArgs, environment);

    if (isNaN(Number(args[0]))) {
      throw super.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsFirstTypeError, {
        expectType: "number",
        received: isTypeArgs(args[0]),
      });
    }

    if (args[1] && typeof args[1] !== "object") {
      throw super.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsTypeError, {
        propsName: "options",
        expectType: "object",
        received: isTypeArgs(args[1]),
      });
    }
  }

  get pkgInfo() {
    return {
      name: "syncbox",
      path: __dirname,
    };
  }

  async buildFunCall(fn: any, value: any, propsName: string, score: Environment) {
    if (fn instanceof FunctionDeclaration || fn instanceof FunctionExpression) {
      runtime.markFunctionCallPosition();
      const callEnv = new Environment(score);

      if (fn.params?.length) {
        const [param] = fn.params[0]!;

        callEnv.create(param, value);
      }

      await fn.body.evaluate(callEnv);

      const res = runtime.getLastExecutionResult();
      runtime.resetLastExecutionResult();
      runtime.finishFunction();

      return res;
    }

    if (isSubclassOfByName(fn, "FunctionBuilder")) {
      return new fn([value], [], score).call();
    }

    throw super.throwErrorFormatters(FunctionBuilderCodeError.ArgumentsTypeError, {
      propsName,
      expectType: "func",
      received: isTypeArgs(fn),
    });
  }

  call() {
    const [bufferSize, options] = this.args;

    if (options?.onSend) {
      const onSend = options.onSend;

      options.onSend = async (value: any) => {
        return this.buildFunCall(onSend, value, "onSend", this.environment);
      };
    }
    if (options?.onRecv) {
      const onRecv = options.onRecv;

      options.onRecv = async (value: any) => {
        return this.buildFunCall(onRecv, value, "onRecv", this.environment);
      };
    }
    if (options?.onClose) {
      const onClose = options.onClose;

      options.onClose = async () => {
        return this.buildFunCall(onClose, null, "onClose", this.environment);
      };
    }

    const channel = new Channel(bufferSize, options);

    return {
      ...(options && { ...options }),
      send: channel.send(),
      trySend: channel.trySend(),
      recv: channel.recv(),
      tryRecv: channel.tryRecv(),
      isClosed: channel.isClosed(),
      cap: channel.cap(),
      len: channel.len(),
      replayClear: channel.replayClear(),
      getReplay: channel.getReplay(),
      close: channel.close(),
      [Environment.SymbolFormatedText]: `Chan { ${JSON.stringify(options || {}, null, 2)} }`,
    };
  }
}

export { Chan };
