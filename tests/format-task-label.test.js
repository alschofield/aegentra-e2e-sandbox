import assert from "node:assert/strict";
import test from "node:test";
import { formatTaskLabel } from "../src/task-board.js";

test("formats a task's ID and title without requiring other fields", () => {
  assert.equal(formatTaskLabel({ id: "TES-10", title: "Add a task label formatter" }),
    "TES-10: Add a task label formatter");
});

test("preserves string contents, including whitespace, empty strings and Unicode", () => {
  assert.equal(formatTaskLabel({ id: "  one ", title: " café: task\n" }),
    "  one :  café: task\n");
  assert.equal(formatTaskLabel({ id: "", title: "" }), ": ");
});

test("rejects missing id or title values", () => {
  for (const task of [{}, { id: "one" }, { title: "Task" }]) {
    assert.throws(() => formatTaskLabel(task), TypeError);
  }
});

test("rejects non-string id and title values without coercion", () => {
  for (const value of [undefined, null, 1, true, {}, [], Symbol("task"), 1n, new String("task")]) {
    assert.throws(() => formatTaskLabel({ id: value, title: "Task" }), TypeError);
    assert.throws(() => formatTaskLabel({ id: "one", title: value }), TypeError);
  }
});

test("rejects non-object task inputs", () => {
  for (const task of [undefined, null, "task", 1, true, Symbol("task"), 1n, () => {}]) {
    assert.throws(() => formatTaskLabel(task), TypeError);
  }
});

test("preserves mutable and frozen task objects and their extra fields", () => {
  const task = { id: "one", title: "Task", status: "ready", dependencies: ["two"] };
  const snapshot = structuredClone(task);
  assert.equal(formatTaskLabel(task), "one: Task");
  assert.deepEqual(task, snapshot);
  Object.freeze(task.dependencies);
  Object.freeze(task);
  assert.equal(formatTaskLabel(task), "one: Task");
  assert.deepEqual(task, snapshot);
});

test("does not mutate invalid task objects", () => {
  const task = { id: 1, title: "Task" };
  assert.throws(() => formatTaskLabel(task), TypeError);
  assert.deepEqual(task, { id: 1, title: "Task" });
});
