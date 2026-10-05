import assert from 'node:assert/strict';
import test from 'node:test';
import { seedTasks, loadTasks, addTask, completeTask, filterTasks, STORAGE_KEY } from '../src/web/app.js';

test('first visit has exactly the required independent seed tasks', () => {
  const tasks = loadTasks(null);
  assert.equal(tasks.recovered, false);
  assert.deepEqual(tasks.tasks.map(({ title, status }) => [title, status]), [
    ['Ship launch checklist', 'ready'],
    ['Wait for design sign-off', 'blocked'],
    ['Review accessibility notes', 'completed'],
  ]);
  tasks.tasks[0].title = 'Changed';
  assert.equal(seedTasks()[0].title, 'Ship launch checklist');
  assert.equal(new Set(seedTasks().map(task => task.id)).size, 3);
  assert.equal(STORAGE_KEY, 'aegentra.task-board.demo.v1');
});

test('addition trims, appends once and rejects blank titles and duplicate IDs', () => {
  const tasks = seedTasks();
  const next = addTask(tasks, '  A new task  ', 'blocked', 'new');
  assert.equal(next.length, 4);
  assert.deepEqual(next[3], { id: 'new', title: 'A new task', status: 'blocked' });
  assert.equal(tasks.length, 3);
  for (const title of ['', ' \n\t ', null]) assert.throws(() => addTask(tasks, title, 'ready', 'new'), TypeError);
  assert.throws(() => addTask(tasks, 'Title', 'ready', tasks[0].id), TypeError);
  assert.throws(() => addTask(tasks, 'Title', 'invalid', 'new'), TypeError);
});

test('search and status combine; no match is an empty array', () => {
  assert.deepEqual(filterTasks(seedTasks(), 'SHIP', 'ready'), [seedTasks()[0]]);
  assert.deepEqual(filterTasks(seedTasks(), 'SHIP', 'blocked'), []);
  assert.deepEqual(filterTasks(seedTasks(), '', 'all'), seedTasks());
  assert.deepEqual(filterTasks(seedTasks(), 'notes', 'completed'), [seedTasks()[2]]);
});

test('completion is immutable, idempotent and serializes for reload', () => {
  const tasks = seedTasks();
  const next = completeTask(tasks, tasks[0].id);
  assert.equal(next.length, tasks.length);
  assert.equal(next[0].status, 'completed');
  assert.equal(tasks[0].status, 'ready');
  assert.deepEqual(completeTask(next, tasks[0].id), next);
  assert.deepEqual(loadTasks(JSON.stringify(next)), { tasks: next, recovered: false });
  assert.deepEqual(completeTask(tasks, 'unknown'), tasks);
});

test('invalid JSON and records recover explicitly, including duplicate IDs', () => {
  for (const raw of ['{', 'null', '{}', '[null]', '[1]', JSON.stringify([
    { id: 'a', title: 'Title', status: 'ready' }, { id: 'a', title: 'Other', status: 'ready' },
  ]), ...[
    { id: '', title: 'Title', status: 'ready' },
    { id: 'a', title: ' ', status: 'ready' },
    { id: 'a', title: 4, status: 'ready' },
    { id: 'a', title: 'Title', status: 'unknown' },
  ].map(task => JSON.stringify([task]))]) {
    assert.deepEqual(loadTasks(raw), { tasks: seedTasks(), recovered: true }, raw);
  }
  assert.deepEqual(loadTasks('[]'), { tasks: [], recovered: false });
});

test('literal malicious title survives state round trip without interpretation', () => {
  const title = '<img src=x onerror=alert(1)>';
  const tasks = addTask(seedTasks(), title, 'ready', 'literal');
  assert.equal(loadTasks(JSON.stringify(tasks)).tasks[3].title, title);
});
