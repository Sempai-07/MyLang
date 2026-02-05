import { StmtType } from "../StmtType";
import { Position } from "../../lexer/token/Position";
import { Environment } from "../../Environment";
import { FunctionCall } from "./FunctionCall";
import { CallExpression } from "./CallExpression";
import { FunctionExpression } from "./FunctionExpression";
import { BlockStatement } from "../statement/BlockStatement";
import { SpawnQueueError, SpawnQueueCodeError } from "../../errors/runtime/SpawnQueueError";
import { runtime } from "../../runtime/Runtime";
import { Spawn, convertSpawnState } from "../../runtime/Spawn";

class SpawnExpression extends StmtType {
  public readonly expression: StmtType;
  public readonly isWait: boolean;
  public readonly position: Position;

  constructor(expression: StmtType, isWait: boolean, position: Position) {
    super();
    this.expression = expression;

    this.isWait = isWait;

    this.position = position;
  }

  async evaluate(score: Environment) {
    if (
      !(
        this.expression instanceof FunctionCall ||
        this.expression instanceof CallExpression ||
        this.expression instanceof BlockStatement ||
        super.isNodeFunction(this.expression) ||
        super.isBuildModuleFunction(this.expression)
      )
    ) {
      throw new SpawnQueueError(SpawnQueueCodeError.NotCalledSpawn, {
        files: score.get("import").paths,
      });
    }

    const task = async () => {
      if (super.isNodeFunction(this.expression)) {
        const callEnvironment = new Environment(score);
        this.expression.parentEnv = callEnvironment;

        if (this.expression instanceof FunctionExpression) {
          if (this.expression.name) {
            score.create(this.expression.name, this.expression);
          }
        }

        return this.expression.call([]);
      } else if (this.expression instanceof BlockStatement) {
        runtime.markFunctionCallPosition();

        const _isBreak = runtime.isBreak;
        const _isReturn = runtime.isReturn;
        const _isContinue = runtime.isContinue;

        await this.expression.evaluate(score);

        // @ts-expect-error
        runtime._isBreak = _isBreak;
        // @ts-expect-error
        runtime._isReturn = _isReturn;
        // @ts-expect-error
        runtime._isContinue = _isContinue;

        const result = runtime.getLastExecutionResult();
        runtime.resetLastExecutionResult();
        runtime.finishFunction();

        return result;
      } else {
        return this.expression.evaluate(score);
      }
    };

    const handler = new Spawn(task);

    runtime.schedulerStack.go(() => handler.run());

    if (this.isWait) {
      await handler.promise;
    }

    return convertSpawnState(handler, score);
  }
}

export { SpawnExpression };
