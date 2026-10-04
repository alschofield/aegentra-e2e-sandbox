import assert from "node:assert/strict";
import test from "node:test";
import { summarizeTasks } from "../src/task-board.js";

test("summarizes an empty task board", () => {
  assert.deepEqual(summarizeTasks([]), {
    total: 0, ready: 0, in_progress: 0, blocked: 0, completed: 0,
  });
});

test("counts each supported status", () => {
  const tasks = [
    { id: "one", status: "ready" },
    { id: "two", status: "ready" },
    { id: "three", status: "in_progress" },
    { id: "four", status: "blocked" },
    { id: "five", status: "completed" },
  ];
  assert.deepEqual(summarizeTasks(tasks), {
    total: 5, ready: 2, in_progress: 1, blocked: 1, completed: 1,
  });
});

test("does not mutate caller-owned tasks", () => {
  const tasks = Object.freeze([
    Object.freeze({ id: "one", status: "ready", title: "Fixture task" }),
  ]);
  assert.equal(summarizeTasks(tasks).ready, 1);
  assert.equal(tasks[0].title, "Fixture task");
});

test("refuses non-array input", () => {
  for (const input of [null, undefined, {}, "tasks", 1]) {
    assert.throws(() => summarizeTasks(input), TypeError);
  }
});

test("refuses missing, non-string and whitespace-only IDs", () => {
  for (const id of [undefined, null, 1, "", "   "]) {
    assert.throws(() => summarizeTasks([{ id, status: "ready" }]), TypeError);
  }
});

test("refuses duplicate IDs", () => {
  assert.throws(() => summarizeTasks([
    { id: "same", status: "ready" },
    { id: "same", status: "completed" },
  ]), TypeError);
});

test("refuses unknown or missing statuses", () => {
  for (const status of [undefined, null, "done", "READY", 1]) {
    assert.throws(() => summarizeTasks([{ id: "one", status }]), TypeError);
  }
});

test("refuses null task entries", () => {
  assert.throws(() => summarizeTasks([null]), TypeError);
});
