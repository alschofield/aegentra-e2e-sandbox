import { isReadyTask } from "./task-ready-predicate.js";

export function listReadyTaskTitles(tasks) {
  if (!Array.isArray(tasks)) {
    throw new TypeError("Tasks must be an array.");
  }

  const titles = [];
  for (const task of tasks) {
    // Validate every row, including tasks that will not be included.
    const ready = isReadyTask(task);
    if (typeof task.id !== "string" || task.id.trim() === "" ||
        typeof task.title !== "string") {
      throw new TypeError("Each task needs a nonempty string ID and a string title.");
    }
    if (ready) titles.push(task.title);
  }
  return titles;
}
