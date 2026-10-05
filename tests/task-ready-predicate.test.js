import assert from "node:assert/strict";
import test from "node:test";
import { isReadyTask } from "../src/task-ready-predicate.js";

test("returns true only for the ready status", () => {
  for (const status of ["ready", "in_progress", "blocked", "completed"]) {
    assert.equal(isReadyTask({ status }), status === "ready");
  }
});

test("rejects non-object inputs and arrays even with a supported status", () => {
  const array = Object.assign([], { status: "ready" });
  const fn = Object.assign(() => {}, { status: "ready" });
  for (const task of [null, undefined, true, false, 0, NaN, 1n, "ready", Symbol("task"), [], array, fn]) {
    assert.throws(() => isReadyTask(task), TypeError);
  }
  assert.throws(() => isReadyTask(), TypeError);
});

test("rejects missing, unsupported, and non-string statuses", () => {
  assert.throws(() => isReadyTask({}), TypeError);
  for (const status of [undefined, null, true, 0, 1n, Symbol("ready"), {}, [], new String("ready"), "", "READY", " ready ", "pending"]) {
    assert.throws(() => isReadyTask({ status }), TypeError);
  }
});

test("does not mutate tasks or unrelated nested properties", () => {
  for (const status of ["ready", "in_progress", "blocked", "completed", "pending"]) {
    const task = Object.freeze({ status, metadata: Object.freeze({ title: "Keep me" }) });
    const before = { status, metadata: { title: "Keep me" } };
    if (status === "pending") {
      assert.throws(() => isReadyTask(task), TypeError);
    } else {
      assert.equal(isReadyTask(task), status === "ready");
    }
    assert.deepEqual(task, before);
  }
});

test("accepts non-array objects without requiring other task fields", () => {
  const task = Object.create(null);
  task.status = "ready";
  assert.equal(isReadyTask(task), true);
});
