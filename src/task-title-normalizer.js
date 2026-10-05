export function normalizeTaskTitle(title) {
  if (typeof title !== "string") {
    throw new TypeError("Task title must be a primitive string.");
  }

  return title.trim();
}
