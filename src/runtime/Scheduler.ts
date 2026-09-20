type TaskFunction = () => void | Promise<void>;

interface Task {
  id: number;
  execute: () => Promise<void>;
}

interface CancellableTaskResult {
  promise: Promise<void>;
  cancel: () => void;
  id: number;
}

interface RepeatingTaskResult {
  cancel: () => void;
}

interface BatchOptions {
  failFast?: boolean;
  maxConcurrent?: number | null;
}

interface BatchResult {
  status: "fulfilled" | "rejected";
  value?: any;
  reason?: any;
}

interface SchedulerStats {
  completed: number;
  failed: number;
  cancelled: number;
  active: number;
  queued: number;
  running: number;
}

class Scheduler {
  private readonly maxConcurrency: number;
  private activeCount = 0;
  private taskId = 0;
  private queue: Task[] = [];
  private priorityQueue: Task[] = [];
  private runningTasks = new Map<number, CancellableTaskResult>();
  private paused = false;
  private destroyed = false;
  private stats = {
    completed: 0,
    failed: 0,
    cancelled: 0,
  };

  constructor(maxConcurrency = 4) {
    this.maxConcurrency = maxConcurrency;
  }

  go(fn: TaskFunction): Promise<void> {
    return this.schedule(fn);
  }

  schedule(fn: TaskFunction): Promise<void> {
    if (this.destroyed) {
      return Promise.reject(new Error("Scheduler is destroyed"));
    }

    return new Promise((resolve, reject) => {
      const task = this._createTask(fn, resolve, reject);
      this.queue.push(task);
      this._processQueue();
    });
  }

  scheduleFirst(fn: TaskFunction): Promise<void> {
    if (this.destroyed) {
      return Promise.reject(new Error("Scheduler is destroyed"));
    }

    return new Promise((resolve, reject) => {
      const task = this._createTask(fn, resolve, reject);
      this.priorityQueue.unshift(task);
      this._processQueue();
    });
  }

  scheduleWithCancel(fn: TaskFunction): CancellableTaskResult {
    if (this.destroyed) {
      const error = new Error("Scheduler is destroyed");
      return {
        promise: Promise.reject(error),
        cancel: () => {},
        id: -1,
      };
    }

    const id = ++this.taskId;
    let cancelled = false;

    const cancel = () => {
      if (cancelled) return;
      cancelled = true;

      this._removeFromQueue(id);

      this.runningTasks.delete(id);
      this.stats.cancelled++;
    };

    const promise = new Promise<void>((resolve, reject) => {
      const task = this._createTask(
        async () => {
          if (cancelled) return;
          return await fn();
        },
        resolve,
        reject,
        id,
      );

      this.queue.push(task);
      this._processQueue();
    });

    const taskControl = { cancel, promise, id };
    this.runningTasks.set(id, taskControl);

    promise.finally(() => {
      this.runningTasks.delete(id);
    });

    return taskControl;
  }

  scheduleDelayed(fn: TaskFunction, delayMs: number): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        this.schedule(fn).then(resolve).catch(reject);
      }, delayMs);
    });
  }

  scheduleRepeating(fn: TaskFunction, intervalMs: number, maxRuns = Infinity): RepeatingTaskResult {
    let runCount = 0;
    let cancelled = false;
    let timeoutId: NodeJS.Timeout | null = null;

    const cancel = () => {
      cancelled = true;
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    };

    const repeatingTask = async () => {
      if (cancelled || runCount >= maxRuns) return;

      try {
        await fn();
        runCount++;

        if (!cancelled && runCount < maxRuns) {
          timeoutId = setTimeout(() => {
            if (!cancelled) {
              this.schedule(repeatingTask);
            }
          }, intervalMs);
        }
      } catch (error) {
        console.error("Repeating task failed:", error);
        cancel();
      }
    };

    this.schedule(repeatingTask);
    return { cancel };
  }

  scheduleBatch(
    tasks: TaskFunction[],
    { failFast = false, maxConcurrent = null }: BatchOptions = {},
  ): Promise<BatchResult[]> {
    const batchConcurrency = maxConcurrent || this.maxConcurrency;
    const results: BatchResult[] = [];
    const errors: Array<{ index: number; error: any }> = [];

    return new Promise((resolve, reject) => {
      if (tasks.length === 0) {
        resolve([]);
        return;
      }

      let completed = 0;
      let index = 0;

      const processBatch = () => {
        const currentBatch = tasks.slice(index, index + batchConcurrency);
        index += currentBatch.length;

        const promises = currentBatch.map((task, i) =>
          this.schedule(task)
            .then((result) => {
              results[index - currentBatch.length + i] = { status: "fulfilled", value: result };
            })
            .catch((error) => {
              errors.push({ index: index - currentBatch.length + i, error });
              results[index - currentBatch.length + i] = { status: "rejected", reason: error };

              if (failFast) {
                reject(error);
                return;
              }
            }),
        );

        Promise.allSettled(promises).then(() => {
          completed += currentBatch.length;

          if (completed >= tasks.length) {
            if (errors.length > 0 && failFast) {
              reject(errors[0]!.error);
            } else {
              resolve(results);
            }
          } else if (!failFast || errors.length === 0) {
            processBatch();
          }
        });
      };

      processBatch();
    });
  }

  clear(): void {
    this.queue.length = 0;
    this.priorityQueue.length = 0;
  }

  pause(): void {
    this.paused = true;
  }

  resume(): void {
    this.paused = false;
    this._processQueue();
  }

  cancelAll(): void {
    for (const [_, task] of this.runningTasks) {
      task.cancel();
    }
    this.runningTasks.clear();
    this.clear();
  }

  destroy(): void {
    this.destroyed = true;
    this.cancelAll();
  }

  get queueSize(): number {
    return this.queue.length + this.priorityQueue.length;
  }

  get isRunning(): boolean {
    return this.activeCount > 0;
  }

  get isPaused(): boolean {
    return this.paused;
  }

  get isDestroyed(): boolean {
    return this.destroyed;
  }

  getStats(): SchedulerStats {
    return {
      ...this.stats,
      active: this.activeCount,
      queued: this.queueSize,
      running: this.runningTasks.size,
    };
  }

  async waitForIdle(): Promise<void> {
    while ((this.isRunning || this.queueSize > 0) && !this.destroyed) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
  }

  async waitForIdleWithTimeout(timeoutMs: number): Promise<void> {
    const startTime = Date.now();

    while ((this.isRunning || this.queueSize > 0) && !this.destroyed) {
      if (Date.now() - startTime > timeoutMs) {
        throw new Error("Timeout waiting for idle state");
      }
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
  }

  private _createTask(
    fn: TaskFunction,
    resolve: (value?: void) => void,
    reject: (reason?: any) => void,
    id?: number,
  ): Task {
    return {
      id: id || ++this.taskId,
      execute: async () => {
        try {
          const result = await fn();
          this.stats.completed++;
          resolve(result);
        } catch (error) {
          this.stats.failed++;
          reject(error);
        }
      },
    };
  }

  private _removeFromQueue(taskId: number): void {
    this.queue = this.queue.filter((task) => task.id !== taskId);
    this.priorityQueue = this.priorityQueue.filter((task) => task.id !== taskId);
  }

  private async _processQueue(): Promise<void> {
    if (this.paused || this.destroyed) return;

    while (this.queueSize > 0 && this.activeCount < this.maxConcurrency) {
      const task = this.priorityQueue.shift() || this.queue.shift();
      if (!task) continue;

      this.activeCount++;

      this._executeTask(task).finally(() => {
        this.activeCount--;

        setImmediate(() => this._processQueue());
      });
    }
  }

  private async _executeTask(task: Task): Promise<void> {
    try {
      await task.execute();
    } catch (error) {
      console.error("Task execution failed:", error);
    }
  }
}

export {
  Scheduler,
  type TaskFunction,
  type CancellableTaskResult,
  type RepeatingTaskResult,
  type BatchOptions,
  type BatchResult,
  type SchedulerStats,
};
