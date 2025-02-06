import { randomUUID } from "node:crypto";
import { StmtType } from "../StmtType";
import { type Position } from "../../lexer/Position";
import { type BlockStatement } from "../statement/BlockStatement";
import { FunctionDeclaration } from "../declaration/FunctionDeclaration";
import { Environment } from "../../Environment";
import { runtime } from "../../runtime/Runtime";

class FunctionExpression extends StmtType {
  public name: string | null;
  public readonly id: string = randomUUID();
  public readonly params: [string, StmtType][];
  public readonly body: BlockStatement;
  public parentEnv: Environment = new Environment();
  public readonly position: Position;

  constructor(
    name: string | null,
    params: [string, StmtType][],
    body: BlockStatement,
    position: Position,
  ) {
    super();

    this.name = name;

    this.params = params;

    this.body = body;

    this.position = position;
  }

  call(args: any[], callerInstance?: any) {
    const callEnvironment = new Environment(this.parentEnv);

    for (let i = 0; i < this.params.length; i++) {
      const argument = args[i];
      const [param, defaultValue] = this.params[i]!;

      callEnvironment.create(
        param,
        argument || defaultValue.evaluate(callEnvironment),
      );
    }
    callEnvironment.create("arguments", args);

    for (const key of Object.keys(callEnvironment)) {
      if (
        !this.parentEnv.has(key) ||
        this.parentEnv.get(key) instanceof FunctionDeclaration
      )
        continue;
      this.parentEnv.update(key, callEnvironment.get(key));
    }

    if (callerInstance) {
      callEnvironment.create(
        "this",
        // @ts-ignore
        Object.assign(callerInstance, this.parentEnv.values),
      );
    } else {
      callEnvironment.create(
        "this",
        this.parentEnv.getRootEnv().get("process"),
      );
    }

    runtime.markFunctionCallPosition();

    this.body.evaluate(callEnvironment);

    const result = runtime.getLastFunctionExecutionResult();

    runtime.resetLastFunctionExecutionResult();

    return result;
  }

  evaluate(score: Environment) {
    const func = new FunctionExpression(
      this.name,
      this.params,
      this.body,
      this.position,
    );

    func.parentEnv = score;

    return func;
  }
}

export { FunctionExpression };
