import { StmtType } from "../StmtType";
import { type Position } from "../../lexer/token/Position";
import { Environment } from "../../Environment";
import { Spawn } from "../../runtime/Spawn";
import { SpawnQueueError, SpawnQueueCodeError } from "../../errors/runtime/SpawnQueueError";

class WaitExpression extends StmtType {
  public readonly expression: StmtType;
  public readonly position: Position;

  constructor(expression: StmtType, position: Position) {
    super();
    this.expression = expression;
    this.position = position;
  }

  async evaluate(score: Environment) {
    const spawn = await this.expression.evaluate(score);

    const spawnHandler = spawn?.[Environment.SpawnQueueSymbol];

    if (!(spawnHandler instanceof Spawn)) {
      throw new SpawnQueueError(SpawnQueueCodeError.ValueIsNotSpawn);
    }

    await spawnHandler.promise;

    return {
      done: spawnHandler.done,
      result: spawnHandler.result,
      error: spawnHandler.error,
      status: spawnHandler.status,
      elapsed: spawnHandler.elapsed,
    };
  }
}

export { WaitExpression };
