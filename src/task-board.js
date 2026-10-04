const STATUSES = new Set(["ready", "in_progress", "blocked", "completed"]);

export function summarizeTasks(tasks) {
  if (!Array.isArray(tasks)) {
    throw new TypeError("Tasks must be an array.");
  }

  const summary = { total: tasks.length, ready: 0, in_progress: 0, blocked: 0, completed: 0 };
  const ids = new Set();

  for (const task of tasks) {
    if (
      !task ||
      typeof task.id !== "string" ||
      task.id.trim() === "" ||
      ids.has(task.id) ||
      !STATUSES.has(task.status)
    ) {
      throw new TypeError("Each task needs a unique nonempty ID and a supported status.");
    }
    ids.add(task.id);
    summary[task.status] += 1;
  }

  return summary;
}
