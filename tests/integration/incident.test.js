// These tests came out of our incident drill (lessons/20-incident-drill.md).
// They make sure that when the database breaks:
//   - the health check notices,
//   - users get a calm message (no scary details),
//   - and the logs tell us the real cause.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { makeTestApp } from '../helpers/test-app.js';

// A returning visitor still has their login cookie ("wristband"), so the
// app has to ask the (broken) database who they are.
const RETURNING_VISITOR = 'sid=returning-visitor-wristband';

describe('when the database is broken (BREAK_DATABASE=true)', () => {
  it('the health check fails with 503', async () => {
    const { api } = makeTestApp({ breakDatabase: true });
    const res = await api.get('/health');
    assert.equal(res.status, 503);
    assert.deepEqual(res.body, { status: 'unhealthy' });
  });

  it('users get a generic 500 message with a request ID, and no details', async () => {
    const { api } = makeTestApp({ breakDatabase: true });
    const res = await api.get('/todos', { cookie: RETURNING_VISITOR });

    assert.equal(res.status, 500);
    assert.equal(res.body.error, 'Something went wrong on our side. Please try again.');
    assert.equal(res.body.requestId, res.headers['x-request-id']);
    assert.equal(res.text.includes('SQLITE'), false, 'no database details for users');
    assert.equal(res.text.includes('BREAK_DATABASE'), false);
  });

  it('the logs show the real cause, with the same request ID', async () => {
    const { api, logs } = makeTestApp({ breakDatabase: true });
    const res = await api.get('/todos', { cookie: RETURNING_VISITOR });

    const errorLine = logs.find((entry) => entry.level === 'error');
    assert.equal(errorLine.requestId, res.body.requestId);
    assert.match(errorLine.error, /SQLITE_CANTOPEN/);
    assert.match(errorLine.error, /BREAK_DATABASE/);
  });

  it('the errors are counted in /metrics', async () => {
    const { api } = makeTestApp({ breakDatabase: true });
    await api.get('/todos', { cookie: RETURNING_VISITOR });
    await api.get('/todos', { cookie: RETURNING_VISITOR });

    const res = await api.get('/metrics');
    assert.equal(res.body.errorsTotal, 2);
  });
});
