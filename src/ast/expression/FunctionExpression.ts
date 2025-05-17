import { randomUUID } from "node:crypto";
import { StmtType } from "../StmtType";
import { type Position } from "../../lexer/Position";
import { type BlockStatement } from "../statement/BlockStatement";
import { FunctionDeclaration } from "../declaration/FunctionDeclaration";
import { Environment, type IOptionsVar } from "../../Environment";
import { runtime } from "../../runtime/Runtime";
import { Task } from "../../runtime/task/Task";
import { PromiseCustom } from "../../native/lib/promises/symbol";

class FunctionExpression extends StmtType {
  public name: string | null;
  public readonly id: string = randomUUID();
  public readonly params: [string, StmtType, true?][];
  public readonly isAsync: boolean;
  public readonly body: BlockStatement;
  public parentEnv: Environment = new Environment();
  public readonly position: Position;

  constructor(
    name: string | null,
    params: [string, StmtType, true?][],
    isAsync: boolean,
    body: BlockStatement,
    position: Position,
  ) {
    super();

    this.name = name;

    this.params = params;

    this.isAsync = isAsync;

    this.body = body;

    this.position = position;
  }

  call(args: { options?: IOptionsVar; value: any }[], callerInstance?: any) {
    const callEnvironment = new Environment(this.parentEnv);

    for (let i = 0; i < this.params.length; i++) {
      const argument = args[i];
      const [param, defaultValue, rest] = this.params[i]!;

      if (!rest) {
        callEnvironment.create(
          param,
          argument?.value || defaultValue.evaluate(callEnvironment),
          argument?.options,
        );
      } else {
        callEnvironment.create(
          param,
          args.slice(i).map(({ value }) => value),
        );
        break;
      }
    }
    callEnvironment.create(
      "arguments",
      args.map(({ value }) => value),
    );

    for (const key of Object.keys(callEnvironment)) {
      if (
        !this.parentEnv.has(key) ||
        this.parentEnv.get(key) instanceof FunctionDeclaration
      )
        continue;
      this.parentEnv.update(key, callEnvironment.get(key));
    }

    if (callerInstance) {
      callEnvironment.create("this", callerInstance);
    } else {
      callEnvironment.create(
        "this",
        this.parentEnv.getRootEnv().get("process"),
      );
    }

    if (this.isAsync) {
      return runtime.taskQueue.addTask(
        new Task(() => {
          runtime.markFunctionCallPosition();

          this.body.evaluate(callEnvironment);

          const result = runtime.getLastFunctionExecutionResult();
          runtime.resetLastFunctionExecutionResult();

          if (result instanceof Task) {
            runtime.taskQueue.addTask(result);
            result[PromiseCustom].start();
            return result[PromiseCustom].getResult();
          }

          return result;
        }),
      );
    } else {
      runtime.markFunctionCallPosition();

      this.body.evaluate(callEnvironment);

      const result = runtime.getLastFunctionExecutionResult();
      runtime.resetLastFunctionExecutionResult();

      return result;
    }
  }

  evaluate(score: Environment) {
    const func = new FunctionExpression(
      this.name,
      this.params,
      this.isAsync,
      this.body,
      this.position,
    );

    func.parentEnv = score;

    return func;
  }
}

export { FunctionExpression };
