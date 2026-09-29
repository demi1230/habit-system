import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';
const require = createRequire(import.meta.url);

function loadModule(path, globals = {}, modules = {}) {
  const source = fs.readFileSync(new URL(path, import.meta.url), 'utf8')
    .replaceAll('import.meta.env.VITE_API_URL', "'/api'")
    .replaceAll('import.meta.env.VITE_USE_MOCK', "'false'");
  const output = ts.transpileModule(source, { fileName: path, compilerOptions: {
    module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022,
  } }).outputText;
  const exports = {};
  vm.runInNewContext(output, { exports, require: id => modules[id] ?? require(id), ...globals });
  return exports;
}

function client(status, message, token = 'stored-token') {
  const storage = new Map(token ? [['access_token', token]] : []);
  const events = [];
  const { api } = loadModule('../src/api/client.ts', {
    localStorage: { getItem: key => storage.get(key) ?? null, removeItem: key => storage.delete(key) },
    window: { dispatchEvent: event => events.push(event.type) }, Event,
    fetch: async () => ({ ok: status < 400, status, statusText: 'Error', json: async () => ({ message }) }),
  });
  return { api, storage, events };
}

test('invalid login stays on the form and does not expire an unrelated session', async () => {
  const { api, storage, events } = client(401, 'Invalid credentials');
  await assert.rejects(api.post('/auth/login', {}), { message: 'Invalid credentials' });
  assert.equal(storage.get('access_token'), 'stored-token');
  assert.deepEqual(events, []);
});

test('protected 401 clears the session and signals React', async () => {
  const { api, storage, events } = client(401, 'Unauthorized');
  await assert.rejects(api.get('/auth/session'));
  assert.equal(storage.has('access_token'), false);
  assert.deepEqual(events, ['auth:expired']);
});

test('server failure preserves the session for retry', async () => {
  const { api, storage, events } = client(503, 'Unavailable');
  await assert.rejects(api.get('/auth/session'));
  assert.equal(storage.get('access_token'), 'stored-token');
  assert.deepEqual(events, []);
});

test('validation arrays become readable messages', async () => {
  const { api } = client(400, ['Email invalid', 'Password too short']);
  await assert.rejects(api.post('/auth/register', {}), { message: 'Email invalid. Password too short' });
});

const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { QueryClient, QueryClientProvider } = require('@tanstack/react-query');
function renderAuth(token) {
  const storage = new Map(token ? [['access_token', token]] : []);
  const { AuthProvider } = loadModule('../src/context/AuthContext.tsx', {
    localStorage: { getItem: key => storage.get(key) ?? null, removeItem: key => storage.delete(key) }, atob,
  }, { '@/api/auth': { authApi: {} }, '@/api/analytics': { analyticsApi: {} } });
  return renderToStaticMarkup(React.createElement(QueryClientProvider, { client: new QueryClient() },
    React.createElement(AuthProvider, null, React.createElement('p', null, 'PRIVATE CONTENT'))));
}

test('stored credentials never render private content before server validation', () => {
  const payload = Buffer.from(JSON.stringify({ sub: '12345678-1234-1234-1234-123456789012' })).toString('base64url');
  const html = renderAuth(`header.${payload}.signature`);
  assert.ok(html.includes('session-gate'));
  assert.ok(html.includes('aria-busy="true"'));
  assert.ok(!html.includes('PRIVATE CONTENT'));
});

test('missing or malformed credentials let route guards render without a loading flash', () => {
  assert.ok(!renderAuth(null).includes('session-gate'));
  assert.ok(!renderAuth('malformed').includes('session-gate'));
});
