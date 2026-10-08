// Health check, metrics, request IDs and logs.

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { makeTestApp, signUp, makeBrowser } = require('../helpers/test-app');

describe('the health check', () => {
  it('says "ok" when the database is working', async () => {
    const { api } = makeTestApp();
    const res = await api.get('/health');
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, { status: 'ok' });
  });
});

describe('request IDs and logs', () => {
  it('every answer has a request ID', async () => {
    const { api } = makeTestApp();
    const res = await api.get('/health');
    assert.match(res.headers['x-request-id'], /^[0-9a-f-]{36}$/);
  });

  it('writes one JSON log line per request, with the same request ID', async () => {
    const { api, logs } = makeTestApp();
    const res = await api.get('/health');

    const line = logs.find((entry) => entry.message === 'request finished');
    assert.equal(line.requestId, res.headers['x-request-id']);
    assert.equal(line.method, 'GET');
    assert.equal(line.path, '/health');
    assert.equal(line.status, 200);
    assert.equal(typeof line.ms, 'number');
  });

  it('never writes passwords into the logs', async () => {
    const { app, logs } = makeTestApp();
    await signUp(app, 'sam');
    assert.equal(JSON.stringify(logs).includes('correct-horse-battery'), false);
  });
});

describe('the metrics page', () => {
  it('counts requests, todos created and failed logins', async () => {
    const { app } = makeTestApp();
    const sam = await signUp(app, 'sam');
    await sam.post('/todos', { text: 'Count me' });

    const stranger = await makeBrowser(app);
    await stranger.post('/auth/login', { username: 'sam', password: 'wrong-guess' });

    const res = await sam.get('/metrics');
    assert.equal(res.status, 200);
    assert.equal(res.body.todosCreated, 1);
    assert.equal(res.body.loginsFailed, 1);
    assert.ok(res.body.requestsTotal >= 4);
    assert.equal(res.body.errorsTotal, 0);
  });
});
