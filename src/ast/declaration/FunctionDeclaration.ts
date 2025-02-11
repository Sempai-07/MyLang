import { randomUUID } from "node:crypto";
import { StmtType } from "../StmtType";
import { type Position } from "../../lexer/Position";
import { type BlockStatement } from "../statement/BlockStatement";
import { Environment } from "../../Environment";
import { runtime } from "../../runtime/Runtime";

class FunctionDeclaration extends StmtType {
  public readonly id: string = randomUUID();
  public readonly name: string;
  public readonly params: [string, StmtType, true?][];
  public readonly body: BlockStatement;
  public parentEnv: Environment = new Environment();
  public readonly position: Position;

  constructor(
    name: string,
    params: [string, StmtType, true?][],
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
      const [param, defaultValue, rest] = this.params[i]!;

      if (!rest) {
        callEnvironment.create(
          param,
          argument || defaultValue.evaluate(callEnvironment),
        );
      } else {
        callEnvironment.create(param, args.slice(i));
        break;
      }
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
      callEnvironment.create("this", callerInstance);
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
    const func = new FunctionDeclaration(
      this.name,
      this.params,
      this.body,
      this.position,
    );

    func.parentEnv = score;

    if (!score.has(func.name)) {
      score.create(func.name, func);
    } else score.update(func.name, func);

    return func;
  }
}

export { FunctionDeclaration };
