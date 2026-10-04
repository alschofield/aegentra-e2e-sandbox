import assert from "node:assert/strict";
import test from "node:test";
import { selectNextTask, summarizeTasks } from "../src/task-board.js";

test("returns null for empty boards and boards without eligible tasks", () => {
  assert.equal(selectNextTask([]), null);
  for (const status of ["blocked", "in_progress", "completed"]) {
    assert.equal(selectNextTask([{ id: "one", status }]), null);
  }
});

test("selects only ready tasks and returns the original object", () => {
  const ready = { id: "ready", status: "ready", priority: 4 };
  const tasks = [
    { id: "blocked", status: "blocked", priority: 1 },
    { id: "working", status: "in_progress", priority: 1 },
    { id: "done", status: "completed", priority: 1 },
    ready,
  ];
  assert.equal(selectNextTask(tasks), ready);
});

test("accepts all priorities, choosing the lowest number regardless of order", () => {
  const tasks = [4, 3, 2, 1].map(priority => ({
    id: String(priority), status: "ready", priority,
  }));
  assert.equal(selectNextTask(tasks), tasks[3]);
  assert.equal(selectNextTask([...tasks].reverse()), tasks[3]);
});

test("defaults omitted priority to 3 and dependencies to none", () => {
  const defaultTask = { id: "a", status: "ready" };
  const explicit = { id: "b", status: "ready", priority: 3, dependencies: [] };
  const low = { id: "c", status: "ready", priority: 4 };
  assert.equal(selectNextTask([low, explicit, defaultTask]), defaultTask);
  const high = { id: "z", status: "ready", priority: 2 };
  assert.equal(selectNextTask([defaultTask, high]), high);
});

test("breaks ties with JavaScript string ordering, not locale or input order", () => {
  const tasks = ["ä", "a", "Z", "10", "2"].map(id => ({ id, status: "ready" }));
  assert.equal(selectNextTask(tasks), tasks[3]);
  assert.equal(selectNextTask([...tasks].reverse()), tasks[3]);
  assert.equal(selectNextTask(tasks.slice(0, 3)), tasks[2]);
});

test("requires every dependency to exist and be completed", () => {
  const candidate = { id: "candidate", status: "ready", dependencies: ["one", "two"] };
  const one = { id: "one", status: "completed" };
  const two = { id: "two", status: "completed" };
  assert.equal(selectNextTask([candidate, one, two]), candidate);
  assert.equal(selectNextTask([candidate, one]), null);
  for (const status of ["ready", "blocked", "in_progress"]) {
    assert.notEqual(selectNextTask([candidate, one, { ...two, status }]), candidate);
  }
});

test("self dependencies are ineligible and repeated dependency IDs have no extra effect", () => {
  assert.equal(selectNextTask([{ id: "self", status: "ready", dependencies: ["self"] }]), null);
  const candidate = { id: "candidate", status: "ready", dependencies: ["done", "done"] };
  assert.equal(selectNextTask([candidate, { id: "done", status: "completed" }]), candidate);
  assert.equal(selectNextTask([{ ...candidate, dependencies: ["missing", "missing"] }]), null);
});

test("rejects invalid boards, entries, base IDs, statuses and duplicate IDs", () => {
  for (const board of [undefined, null, {}, "tasks", 1]) {
    assert.throws(() => selectNextTask(board), TypeError);
  }
  for (const entry of [null, undefined, 1, "task", {}]) {
    assert.throws(() => selectNextTask([entry]), TypeError);
  }
  assert.throws(() => selectNextTask(new Array(1)), TypeError);
  for (const id of [undefined, null, 1, "", "  ", {}, []]) {
    assert.throws(() => selectNextTask([{ id, status: "ready" }]), TypeError);
  }
  for (const status of [undefined, null, "done", "READY", 1, {}]) {
    assert.throws(() => selectNextTask([{ id: "one", status }]), TypeError);
  }
  assert.throws(() => selectNextTask([
    { id: "same", status: "ready" }, { id: "same", status: "completed" },
  ]), TypeError);
});

test("validates priority and dependency declarations even on noneligible tasks", () => {
  for (const status of ["ready", "blocked", "in_progress", "completed"]) {
    const valid = { id: "valid", status: "ready", priority: 1 };
    for (const priority of [null, 0, 5, -1, 1.5, NaN, Infinity, "1", true, {}, []]) {
      assert.throws(() => selectNextTask([valid, { id: "bad", status, priority }]), TypeError);
    }
    for (const dependencies of [null, "valid", 1, {}, [null], [undefined], [1], [""], ["  "], [[]], [{}], new Array(1)]) {
      assert.throws(() => selectNextTask([valid, { id: "bad", status, dependencies }]), TypeError);
    }
  }
  assert.throws(() => selectNextTask([
    { id: "bad", status: "ready", dependencies: ["missing"], priority: 0 },
  ]), TypeError);
});

test("does not mutate mutable or frozen boards, objects or dependency arrays", () => {
  const tasks = [
    { id: "z", status: "ready", priority: 4, dependencies: [] },
    { id: "a", status: "ready", dependencies: ["done", "done"] },
    { id: "done", status: "completed" },
  ];
  const snapshot = structuredClone(tasks);
  assert.equal(selectNextTask(tasks), tasks[1]);
  assert.equal(selectNextTask(tasks), tasks[1]);
  assert.deepEqual(tasks, snapshot);
  for (const task of tasks) {
    if (task.dependencies) Object.freeze(task.dependencies);
    Object.freeze(task);
  }
  Object.freeze(tasks);
  assert.equal(selectNextTask(tasks), tasks[1]);
  assert.equal(selectNextTask(tasks), tasks[1]);
  assert.deepEqual(tasks, snapshot);
});

test("summarizeTasks continues to ignore optional selection declarations", () => {
  assert.deepEqual(summarizeTasks([
    { id: "one", status: "ready", priority: 0, dependencies: null },
  ]), { total: 1, ready: 1, in_progress: 0, blocked: 0, completed: 0 });
});
