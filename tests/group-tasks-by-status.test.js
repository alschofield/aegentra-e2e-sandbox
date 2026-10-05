import assert from "node:assert/strict";
import test from "node:test";
import { groupTasksByStatus } from "../src/task-board.js";

test("returns an empty array for every supported status on an empty board", () => {
  assert.deepEqual(groupTasksByStatus([]), {
    ready: [], in_progress: [], blocked: [], completed: [],
  });
});

test("groups every status and preserves input order and task identity", () => {
  const tasks = [
    { id: "z", status: "ready" },
    { id: "blocked-one", status: "blocked" },
    { id: "working-one", status: "in_progress" },
    { id: "done-one", status: "completed" },
    { id: "a", status: "ready" },
    { id: "done-two", status: "completed" },
    { id: "blocked-two", status: "blocked" },
    { id: "working-two", status: "in_progress" },
  ];
  const groups = groupTasksByStatus(tasks);
  assert.deepEqual(groups, {
    ready: [tasks[0], tasks[4]],
    in_progress: [tasks[2], tasks[7]],
    blocked: [tasks[1], tasks[6]],
    completed: [tasks[3], tasks[5]],
  });
  for (const task of tasks) {
    assert.ok(groups[task.status].some(entry => entry === task));
  }
});

test("does not mutate mutable or frozen inputs and returns fresh group arrays", () => {
  const tasks = [
    { id: "b", status: "ready", title: "Keep", dependencies: ["a"] },
    { id: "a", status: "completed" },
  ];
  const snapshot = structuredClone(tasks);
  groupTasksByStatus(tasks);
  assert.deepEqual(tasks, snapshot);
  Object.freeze(tasks[0].dependencies);
  tasks.forEach(Object.freeze);
  Object.freeze(tasks);
  const first = groupTasksByStatus(tasks);
  const second = groupTasksByStatus(tasks);
  for (const status of Object.keys(first)) {
    assert.notEqual(first[status], second[status]);
  }
  first.ready.pop();
  assert.equal(second.ready.length, 1);
  assert.deepEqual(tasks, snapshot);
});

test("rejects non-arrays, sparse arrays and invalid task shapes", () => {
  for (const input of [undefined, null, {}, "tasks", 1, true]) {
    assert.throws(() => groupTasksByStatus(input), TypeError);
  }
  for (const task of [undefined, null, {}, [], "task", 1, true]) {
    assert.throws(() => groupTasksByStatus([task]), TypeError);
  }
  assert.throws(() => groupTasksByStatus(new Array(1)), TypeError);
  for (const task of [[], () => {}]) {
    task.id = "one";
    task.status = "ready";
    assert.throws(() => groupTasksByStatus([task]), TypeError);
  }
});

test("rejects invalid IDs, duplicate IDs and unsupported statuses", () => {
  for (const id of [undefined, null, "", "  ", 1, {}, []]) {
    assert.throws(() => groupTasksByStatus([{ id, status: "ready" }]), TypeError);
  }
  for (const status of [undefined, null, "done", "READY", "__proto__", 1, {}]) {
    assert.throws(() => groupTasksByStatus([{ id: "one", status }]), TypeError);
  }
  assert.throws(() => groupTasksByStatus([
    { id: "same", status: "ready" },
    { id: "same", status: "completed" },
  ]), TypeError);
});
