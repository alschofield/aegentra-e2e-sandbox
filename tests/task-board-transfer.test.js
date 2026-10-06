import assert from 'node:assert/strict';
import test from 'node:test';
import {
  seedTasks, loadTasks, filterTasks, STORAGE_KEY,
  parseTaskTransfer, exportTaskTransfer, importTaskTransfer, MAX_IMPORT_BYTES,
} from '../src/web/app.js';

const task = { id: 'a', title: 'A title', status: 'ready' };
const encode = tasks => JSON.stringify({ schema_version: 1, tasks });

test('export preserves all tasks and order independently of filtered views', () => {
  const tasks = seedTasks();
  assert.equal(filterTasks(tasks, 'SHIP', 'ready').length, 1);
  assert.deepEqual(JSON.parse(exportTaskTransfer(tasks)), { schema_version: 1, tasks });
  assert.deepEqual(parseTaskTransfer(exportTaskTransfer(tasks)), tasks);
  assert.equal(exportTaskTransfer([]), '{"schema_version":1,"tasks":[]}');
});

test('import trims titles, preserves IDs and literal HTML-looking text', () => {
  const title = '<img src=x onerror=alert(1)>';
  const tasks = parseTaskTransfer(encode([
    { ...task, id: ' a ', title: `  ${title}  ` },
    { id: 'b', title: 'Blocked', status: 'blocked' },
    { id: 'c', title: 'Done', status: 'completed' },
  ]));
  assert.equal(tasks[0].title, title);
  assert.equal(tasks[0].id, ' a ');
  assert.deepEqual(parseTaskTransfer(encode([])), []);
});

test('reject malformed JSON, wrong root shape, version, missing and extra fields', () => {
  for (const text of ['{', 'null', '[]', '1', ...[
    {}, { tasks: [] }, { schema_version: 1 },
    { schema_version: '1', tasks: [] }, { schema_version: 2, tasks: [] },
    { schema_version: 1, tasks: {} }, { schema_version: 1, tasks: null },
    { schema_version: 1, tasks: [], extra: true },
  ].map(JSON.stringify)]) assert.throws(() => parseTaskTransfer(text), TypeError, text);
});

test('reject invalid tasks, duplicate IDs and extra task fields', () => {
  for (const invalid of [null, [], 1, {},
    { title: 'A', status: 'ready' }, { id: 'a', status: 'ready' }, { id: 'a', title: 'A' },
    { ...task, id: '' }, { ...task, id: ' \t' }, { ...task, id: 1 },
    { ...task, title: '' }, { ...task, title: ' \n' }, { ...task, title: 1 },
    { ...task, status: 'paused' }, { ...task, status: null },
    { ...task, extra: true }, { ...task, __proto__: null, constructor: 'extra' },
  ]) assert.throws(() => parseTaskTransfer(encode([invalid])), TypeError);
  assert.throws(() => parseTaskTransfer(encode([task, { ...task, title: 'Other' }])), TypeError);
});

test('200-task and 100-KiB inclusive boundaries are measured in UTF-8 bytes', () => {
  const tasks = Array.from({ length: 200 }, (_, i) => ({ ...task, id: String(i) }));
  assert.equal(parseTaskTransfer(encode(tasks)).length, 200);
  assert.throws(() => parseTaskTransfer(encode([...tasks, { ...task, id: '201' }])), TypeError);
  const base = encode([task]);
  const exact = base + ' '.repeat(MAX_IMPORT_BYTES - new TextEncoder().encode(base).length);
  assert.deepEqual(parseTaskTransfer(exact), [task]);
  assert.throws(() => parseTaskTransfer(exact + ' '), TypeError);
  const multibyte = encode([{ ...task, title: 'é'.repeat(52000) }]);
  assert.ok(multibyte.length < MAX_IMPORT_BYTES);
  assert.throws(() => parseTaskTransfer(multibyte), TypeError);
});

test('import replaces only the demo key in one write and survives state reload, including empty boards', () => {
  const data = new Map([[STORAGE_KEY, JSON.stringify(seedTasks())], ['unrelated', 'keep']]);
  const writes = [];
  const storage = { setItem(key, value) { writes.push(key); data.set(key, value); } };
  const next = importTaskTransfer(encode([task]), storage);
  assert.deepEqual(next, [task]);
  assert.deepEqual(loadTasks(data.get(STORAGE_KEY)).tasks, next);
  assert.deepEqual(writes, [STORAGE_KEY]);
  assert.equal(data.get('unrelated'), 'keep');
  assert.deepEqual(importTaskTransfer(encode([]), storage), []);
  assert.deepEqual(loadTasks(data.get(STORAGE_KEY)).tasks, []);
});

test('invalid imports never write storage; storage failure never returns a replacement', () => {
  let writes = 0;
  const storage = { setItem() { writes++; } };
  for (const text of ['{', encode([task, task]), encode([{ ...task, status: 'paused' }]),
    JSON.stringify({ schema_version: 2, tasks: [] }), ' '.repeat(MAX_IMPORT_BYTES + 1)]) {
    assert.throws(() => importTaskTransfer(text, storage));
  }
  assert.equal(writes, 0);
  assert.throws(() => importTaskTransfer(encode([task]), null));
  assert.throws(() => importTaskTransfer(encode([task]), {
    setItem() { throw new Error('quota exceeded'); },
  }), /quota exceeded/);
});
