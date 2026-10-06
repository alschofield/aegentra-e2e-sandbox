import assert from 'node:assert/strict';
import test from 'node:test';
import http from 'node:http';
import { once } from 'node:events';
import { createTaskBoardServer } from '../src/task-board-server.js';

function request(server, path, method = 'GET') {
  return new Promise((resolve, reject) => {
    const req = http.request({ host: '127.0.0.1', port: server.address().port, path, method }, res => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
      res.on('error', reject);
    });
    req.on('error', reject);
    req.end();
  });
}

test('factory returns an unstarted server', async () => {
  const server = createTaskBoardServer();
  assert.equal(server.listening, false);
  assert.equal(server.address(), null);
});

test('fixed routes, security headers and raw traversal rejection', async t => {
  const server = createTaskBoardServer();
  t.after(() => new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve())));
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  for (const [path, type, text] of [
    ['/', 'text/html', 'Task Board'],
    ['/app.js', 'text/javascript', 'seedTasks'],
    ['/app.css', 'text/css', ':focus-visible'],
    ['/?demo=1', 'text/html', 'Task Board'],
  ]) {
    const response = await request(server, path);
    assert.equal(response.status, 200, path);
    assert.ok(response.headers['content-type'].startsWith(type));
    assert.ok(response.body.includes(text));
    assert.equal(response.headers['x-content-type-options'], 'nosniff');
    assert.ok(response.headers['content-security-policy'].includes("script-src 'self'"));
    assert.ok(response.headers['content-security-policy'].includes("connect-src 'none'"));
    assert.ok(!response.headers['content-security-policy'].includes('unsafe-inline'));
    assert.ok(!response.headers['content-security-policy'].includes('unsafe-eval'));
  }
  for (const path of [
    '/missing', '/README.md', '/package.json', '/src/task-board.js', '/.git/config',
    '/../package.json', '/web/../../package.json', '/%2e%2e/package.json',
    '/%2E%2E%2Fpackage.json', '/%252e%252e%252fpackage.json',
    '/..%5cpackage.json', '/%2fapp.js', '//app.js', '/./app.js', '/app.js/extra',
    '/%00', '/%ZZ', '/app%2ejs',
  ]) {
    const response = await request(server, path);
    assert.equal(response.status, 404, path);
    assert.equal(response.body, 'Not found');
    assert.equal(response.headers['x-content-type-options'], 'nosniff');
    assert.ok(response.headers['content-security-policy']);
  }
  assert.equal((await request(server, '/', 'POST')).status, 404);
  const head = await request(server, '/app.js', 'HEAD');
  assert.equal(head.status, 200);
  assert.equal(head.body, '');
});
