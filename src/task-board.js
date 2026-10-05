const STATUSES = new Set(["ready", "in_progress", "blocked", "completed"]);

export function formatTaskLabel(task) {
  if (
    task === null ||
    typeof task !== "object" ||
    typeof task.id !== "string" ||
    typeof task.title !== "string"
  ) {
    throw new TypeError("Task must be an object with string id and title values.");
  }

  return `${task.id}: ${task.title}`;
}

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

export function groupTasksByStatus(tasks) {
  // Reuse the board's ID and status validation without changing existing APIs.
  summarizeTasks(tasks);
  const groups = { ready: [], in_progress: [], blocked: [], completed: [] };
  for (const task of tasks) {
    if (typeof task !== "object" || Array.isArray(task)) {
      throw new TypeError("Each task must be an object.");
    }
    groups[task.status].push(task);
  }
  return groups;
}

export function selectNextTask(tasks) {
  // Validate the entire board, including tasks that cannot be selected.
  summarizeTasks(tasks);
  const byId = new Map();
  for (const task of tasks) {
    if (task.priority !== undefined &&
        (!Number.isInteger(task.priority) || task.priority < 1 || task.priority > 4)) {
      throw new TypeError("Priority must be an integer from 1 through 4.");
    }
    if (task.dependencies !== undefined) {
      if (!Array.isArray(task.dependencies)) {
        throw new TypeError("Dependencies must be an array of nonempty string IDs.");
      }
      for (const id of task.dependencies) {
        if (typeof id !== "string" || id.trim() === "") {
          throw new TypeError("Dependencies must be an array of nonempty string IDs.");
        }
      }
    }
    byId.set(task.id, task);
  }

  let selected = null;
  for (const task of tasks) {
    if (task.status !== "ready") continue;
    const dependencies = task.dependencies ?? [];
    if (!dependencies.every(id => id !== task.id && byId.get(id)?.status === "completed")) {
      continue;
    }
    const priority = task.priority ?? 3;
    if (selected === null || priority < (selected.priority ?? 3) ||
        (priority === (selected.priority ?? 3) && task.id < selected.id)) {
      selected = task;
    }
  }
  return selected;
}
