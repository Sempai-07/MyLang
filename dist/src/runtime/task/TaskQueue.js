"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskQueue = void 0;
class TaskQueue {
    tasks = [];
    addTask(task) {
        this.tasks.push(task);
        return task;
    }
    *[Symbol.iterator]() {
        for (const task of this.tasks) {
            yield task;
        }
    }
}
exports.TaskQueue = TaskQueue;
