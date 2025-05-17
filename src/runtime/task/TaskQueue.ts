import { type Task } from "./Task";

class TaskQueue {
  private tasks: Task[] = [];

  addTask(task: Task) {
    this.tasks.push(task);
    return task;
  }

  *[Symbol.iterator]() {
    for (const task of this.tasks) {
      yield task;
    }
  }
}

export { TaskQueue };
