const STATUSES = new Set(["ready", "in_progress", "blocked", "completed"]);

export function isReadyTask(task) {
  if (task === null || typeof task !== "object" || Array.isArray(task)) {
    throw new TypeError("Task must be a non-null, non-array object.");
  }

  const status = task.status;
  if (typeof status !== "string" || !STATUSES.has(status)) {
    throw new TypeError("Task must have a supported string status.");
  }

  return status === "ready";
}
