import { randomUUID } from "node:crypto";
import { StmtType, type ITextOptions } from "../StmtType";
import { type Position } from "../../lexer/token/Position";
import { type BlockStatement } from "../statement/BlockStatement";
import { FunctionDeclaration } from "../declaration/FunctionDeclaration";
import { Environment, type IOptionsVar } from "../../Environment";
import { runtime } from "../../runtime/Runtime";

class FunctionExpression extends StmtType {
  public name: string | null;
  public readonly id: string = randomUUID();
  public readonly params: [string, StmtType, true?][];
  public readonly body: BlockStatement;
  public parentEnv: Environment = new Environment();
  public readonly position: Position;

  constructor(
    name: string | null,
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

  async call(args: { options?: IOptionsVar; value: any }[], callerInstance?: any) {
    const callEnvironment = new Environment(this.parentEnv);

    for (let i = 0; i < this.params.length; i++) {
      const argument = args[i];
      const [param, defaultValue, rest] = this.params[i]!;

      if (!rest) {
        if (argument) {
          callEnvironment.create(param, argument.value, argument.options);
          continue;
        }

        callEnvironment.create(param, await defaultValue.evaluate(callEnvironment));
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
      if (!this.parentEnv.has(key) || this.parentEnv.get(key) instanceof FunctionDeclaration)
        continue;
      this.parentEnv.update(key, callEnvironment.get(key));
    }

    if (this.parentEnv.has("this")) {
      callEnvironment.create("this", this.parentEnv.get("this"));
    } else if (callerInstance) {
      callEnvironment.create("this", callerInstance);
    } else {
      callEnvironment.create("this", this.parentEnv.getRootEnv().get("process"));
    }

    try {
      runtime.markFunctionCallPosition();

      await this.body.evaluate(callEnvironment);

      const result = runtime.getLastExecutionResult();
      runtime.resetLastExecutionResult();
      runtime.finishFunction();

      return result;
    } catch (err) {
      throw super.throwErrorFormatters(err, callEnvironment, ({ file, position }: ITextOptions) => {
        return `${this.name ? this.name : "[anonymousFunc]"} (${file}:${position.line}:${position.column})`;
      });
    }
  }

  evaluate(score: Environment) {
    const func = new FunctionExpression(this.name, this.params, this.body, this.position);

    func.parentEnv = score;

    return func;
  }
}

export { FunctionExpression };
