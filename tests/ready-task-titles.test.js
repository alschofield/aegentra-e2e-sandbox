import assert from "node:assert/strict";
import test from "node:test";
import { listReadyTaskTitles } from "../src/ready-task-titles.js";

const row = (status, title = "Title", id = "task") => ({ id, title, status });

test("lists only ready titles in input order without normalizing contents", () => {
  assert.deepEqual(listReadyTaskTitles([
    row("blocked", "Excluded"),
    row("ready", "  Zulu\n"),
    row("in_progress", "Excluded"),
    row("ready", ""),
    row("completed", "Excluded"),
    row("ready", "Alpha 🚀"),
    row("ready", "Alpha 🚀"),
  ]), ["  Zulu\n", "", "Alpha 🚀", "Alpha 🚀"]);
});

test("returns empty arrays for empty boards and boards without ready tasks", () => {
  assert.deepEqual(listReadyTaskTitles([]), []);
  assert.deepEqual(listReadyTaskTitles([
    row("blocked"), row("in_progress"), row("completed"),
  ]), []);
});

test("rejects non-array boards", () => {
  for (const board of [undefined, null, {}, "", 0, true, new Set()]) {
    assert.throws(() => listReadyTaskTitles(board), TypeError);
  }
});

test("rejects malformed rows, including sparse array entries", () => {
  const array = Object.assign([], row("ready"));
  const fn = Object.assign(() => {}, row("ready"));
  for (const task of [null, undefined, [], array, fn, "task", 0, true, 1n, Symbol("task")]) {
    assert.throws(() => listReadyTaskTitles([row("ready"), task]), TypeError);
  }
  assert.throws(() => listReadyTaskTitles(new Array(1)), TypeError);
});

test("validates IDs and titles even on non-ready rows", () => {
  for (const status of ["ready", "in_progress", "blocked", "completed"]) {
    for (const id of [undefined, null, "", " \t\n", 0, true, {}, [], new String("id")]) {
      assert.throws(() => listReadyTaskTitles([row("ready"), { ...row(status), id }]), TypeError);
    }
    for (const title of [null, 0, true, {}, [], new String("title"), Symbol("title")]) {
      assert.throws(() => listReadyTaskTitles([row("ready"), row(status, title)]), TypeError);
    }
    assert.throws(() => listReadyTaskTitles([{ id: "id", status }]), TypeError);
    assert.throws(() => listReadyTaskTitles([{ title: "Title", status }]), TypeError);
  }
});

test("rejects unsupported and non-string statuses", () => {
  for (const status of [undefined, null, "", "pending", "READY", " ready ", 0, true, {}, [], new String("ready")]) {
    assert.throws(() => listReadyTaskTitles([row("ready"), row(status)]), TypeError);
  }
});

test("preserves mutable and frozen boards and tasks", () => {
  for (const frozen of [false, true]) {
    const tasks = [row("ready", " Keep "), row("blocked"), row("ready", "Last")];
    const before = tasks.map(task => ({ ...task }));
    const identities = [...tasks];
    if (frozen) {
      tasks.forEach(Object.freeze);
      Object.freeze(tasks);
    }
    const titles = listReadyTaskTitles(tasks);
    assert.deepEqual(titles, [" Keep ", "Last"]);
    titles.push("Independent result");
    assert.deepEqual(tasks, before);
    tasks.forEach((task, index) => assert.equal(task, identities[index]));
  }
});

test("leaves invalid mutable and frozen inputs unchanged on failure", () => {
  for (const frozen of [false, true]) {
    const tasks = [row("ready"), row("blocked", null)];
    const before = tasks.map(task => ({ ...task }));
    if (frozen) {
      tasks.forEach(Object.freeze);
      Object.freeze(tasks);
    }
    assert.throws(() => listReadyTaskTitles(tasks), TypeError);
    assert.deepEqual(tasks, before);
  }
});
