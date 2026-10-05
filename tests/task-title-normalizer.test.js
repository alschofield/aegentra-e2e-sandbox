import assert from "node:assert/strict";
import test from "node:test";
import { normalizeTaskTitle } from "../src/task-title-normalizer.js";

test("removes surrounding whitespace", () => {
  assert.equal(normalizeTaskTitle("  Task title  "), "Task title");
  assert.equal(normalizeTaskTitle("\t\r\nTask title\n\r\t"), "Task title");
  assert.equal(normalizeTaskTitle("\u00a0\u2003Task title\u2003\u00a0"), "Task title");
});

test("preserves case and internal whitespace", () => {
  assert.equal(normalizeTaskTitle("  MiXeD  Case\tTask\nTitle  "), "MiXeD  Case\tTask\nTitle");
  assert.equal(normalizeTaskTitle("Already Normal"), "Already Normal");
});

test("returns an empty string for empty and whitespace-only titles", () => {
  for (const title of ["", " ", "\t\r\n", "\u00a0\u2003"]) {
    assert.equal(normalizeTaskTitle(title), "");
  }
});

test("rejects non-string inputs", () => {
  for (const title of [undefined, null, 0, NaN, true, false, {}, [], Symbol("title"), 1n, new String("title"), () => "title"]) {
    assert.throws(() => normalizeTaskTitle(title), TypeError);
  }
  assert.throws(() => normalizeTaskTitle(), TypeError);
});

test("rejects objects without invoking coercion or trim methods", () => {
  let calls = 0;
  const title = {
    [Symbol.toPrimitive]() { calls += 1; return "title"; },
    toString() { calls += 1; return "title"; },
    trim() { calls += 1; return "title"; },
  };
  assert.throws(() => normalizeTaskTitle(title), TypeError);
  assert.equal(calls, 0);
});
