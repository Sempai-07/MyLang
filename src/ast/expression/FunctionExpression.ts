import { randomUUID } from "node:crypto";
import { StmtType } from "../StmtType";
import { type Position } from "../../lexer/Position";
import { type BlockStatement } from "../statement/BlockStatement";
import { FunctionDeclaration } from "../declaration/FunctionDeclaration";
import { Environment } from "../../Environment";

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

  call(args: any[], callerInstance?: any): any {
    //     if (this.params.length !== args.length) {
    //       throw "function declared parameters are not matched with arguments";
    //     }

    const callEnvironment = new Environment(this.parentEnv);

    for (let i = 0; i < this.params.length; i++) {
      const argument = args[i];
      const [param, defaultValue] = this.params[i]!;

      callEnvironment.create(param, argument || defaultValue);
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

    // if function is called by an instance, this will be this instance, or it will be the global process object
    if (callerInstance) {
      callEnvironment.create("this", callerInstance);
    } else {
      callEnvironment.create(
        "this",
        this.parentEnv.getRootEnv().get("process"),
      );
    }

    return this.body.evaluate(callEnvironment);
  }

  override evaluate(score: Environment): any {
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
