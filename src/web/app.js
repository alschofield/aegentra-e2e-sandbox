export const STORAGE_KEY = 'aegentra.task-board.demo.v1';
export const STATUSES = ['ready', 'blocked', 'completed'];

export function seedTasks() {
  return [
    { id: 'seed-launch', title: 'Ship launch checklist', status: 'ready' },
    { id: 'seed-design', title: 'Wait for design sign-off', status: 'blocked' },
    { id: 'seed-accessibility', title: 'Review accessibility notes', status: 'completed' },
  ];
}

export function loadTasks(raw) {
  if (raw === null) return { tasks: seedTasks(), recovered: false };
  try {
    const tasks = JSON.parse(raw);
    const ids = new Set();
    if (!Array.isArray(tasks)) throw new Error('Invalid board');
    for (const task of tasks) {
      if (!task || typeof task !== 'object' || Array.isArray(task) ||
          typeof task.id !== 'string' || !task.id.trim() || ids.has(task.id) ||
          typeof task.title !== 'string' || !task.title.trim() || !STATUSES.includes(task.status)) {
        throw new Error('Invalid task');
      }
      ids.add(task.id);
    }
    return { tasks: tasks.map(({ id, title, status }) => ({ id, title: title.trim(), status })), recovered: false };
  } catch {
    return { tasks: seedTasks(), recovered: true };
  }
}

export function addTask(tasks, title, status, id) {
  const trimmed = typeof title === 'string' ? title.trim() : '';
  if (!trimmed) throw new TypeError('Enter a task title.');
  if (!STATUSES.includes(status) || typeof id !== 'string' || !id.trim() || tasks.some(task => task.id === id)) {
    throw new TypeError('Invalid status or ID.');
  }
  return [...tasks, { id, title: trimmed, status }];
}

export function completeTask(tasks, id) {
  return tasks.map(task => task.id === id ? { ...task, status: 'completed' } : task);
}

export function filterTasks(tasks, search, status) {
  const query = search.toLowerCase();
  return tasks.filter(task => task.title.toLowerCase().includes(query) && (status === 'all' || task.status === status));
}

function startBoard() {
  const get = id => document.getElementById(id);
  const notice = get('notice');
  let storage;
  let raw = null;
  try { storage = window.localStorage; raw = storage.getItem(STORAGE_KEY); }
  catch { notice.textContent = 'Browser storage is unavailable. Changes last only in this tab.'; }
  const loaded = loadTasks(raw);
  let tasks = loaded.tasks;
  if (loaded.recovered) notice.textContent = 'Saved demo data was invalid. The three example tasks have been restored.';

  function save() {
    try {
      if (!storage) throw new Error('Storage unavailable');
      storage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      return true;
    } catch {
      notice.textContent = 'Browser storage is unavailable. Changes last only in this tab.';
      return false;
    }
  }
  function render() {
    const visible = filterTasks(tasks, get('search').value, get('filter').value);
    get('count').textContent = `${visible.length} of ${tasks.length} tasks shown`;
    get('tasks').replaceChildren();
    for (const task of visible) {
      const item = document.createElement('li');
      const details = document.createElement('div');
      const title = document.createElement('h3');
      title.textContent = task.title;
      const status = document.createElement('span');
      status.className = `badge ${task.status}`;
      status.textContent = task.status[0].toUpperCase() + task.status.slice(1);
      details.append(title, status);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'secondary';
      button.textContent = 'Complete task';
      button.setAttribute('aria-label', `Complete task: ${task.title}`);
      button.setAttribute('aria-disabled', String(task.status === 'completed'));
      button.addEventListener('click', () => {
        if (task.status === 'completed') return;
        tasks = completeTask(tasks, task.id);
        const saved = save();
        render();
        // Rendering may remove the focused button (especially with a status filter).
        get('list-heading').setAttribute('tabindex', '-1');
        get('list-heading').focus();
        if (saved) notice.textContent = `Completed: ${task.title}`;
      });
      item.append(details, button);
      get('tasks').append(item);
    }
    get('empty').hidden = visible.length !== 0;
    get('empty').textContent = tasks.length ? 'No matching tasks' : 'No tasks yet. Add a task above to get started.';
  }
  get('add-form').addEventListener('submit', event => {
    event.preventDefault();
    const title = get('task-title');
    if (!title.value.trim()) {
      get('title-error').textContent = 'Enter a task title. Whitespace alone is not a title.';
      title.setAttribute('aria-invalid', 'true');
      title.focus();
      return;
    }
    let id;
    do { id = globalThis.crypto.randomUUID(); } while (tasks.some(task => task.id === id));
    tasks = addTask(tasks, title.value, get('task-status').value, id);
    save();
    title.value = '';
    title.removeAttribute('aria-invalid');
    get('title-error').textContent = '';
    render();
    title.focus();
  });
  get('search').addEventListener('input', render);
  get('filter').addEventListener('change', render);
  get('reset').addEventListener('click', () => {
    tasks = seedTasks();
    get('search').value = '';
    get('filter').value = 'all';
    get('add-form').reset();
    get('task-title').removeAttribute('aria-invalid');
    get('title-error').textContent = '';
    const saved = save();
    render();
    if (saved) notice.textContent = 'Demo reset. The three example tasks have been restored.';
  });
  save();
  render();
}

if (typeof document !== 'undefined') startBoard();
