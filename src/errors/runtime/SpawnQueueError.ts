import { formatMessage } from "../utils";
import { BaseError } from "../BaseError";

enum SpawnQueueCodeError {
  ValueIsNotSpawn = "VALUE_IS_NOT_SPAWN",
  NotCalledSpawn = "NOT_CALLED_SPAWN",
}

const SpawnQueueMessageError = {
  [SpawnQueueCodeError.ValueIsNotSpawn]: "Operator wait expected a Spawn instance",
  [SpawnQueueCodeError.NotCalledSpawn]:
    "When spawning, you must only provide functions, methods, block or calls to them",
};

class SpawnQueueError extends BaseError {
  constructor(code: SpawnQueueCodeError, format?: Record<string, any>) {
    super(
      format ? formatMessage(SpawnQueueMessageError[code], format) : SpawnQueueMessageError[code],
      {
        code,
        name: "SpawnQueueError",
        ...(format?.files && { files: format.files }),
      },
    );
  }
}

export { SpawnQueueError, SpawnQueueCodeError, SpawnQueueMessageError };
