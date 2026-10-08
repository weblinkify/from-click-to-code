// CSRF protection: changes need the secret handshake token.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { makeTestApp, signUp, sendRequest } from '../helpers/test-app.js';
import { makeCsrfToken } from '../../lib/csrf.js';

describe('the CSRF secret handshake', () => {
  it('blocks a change with no token (403)', async () => {
    makeTestApp();
    const sam = await signUp('sam');

    const res = await sam.send('POST', '/todos', { body: { text: 'No handshake' }, withCsrf: false });
    assert.equal(res.status, 403);
  });

  it('blocks a change when the header and cookie do not match', async () => {
    const { config } = makeTestApp();
    const sam = await signUp('sam');
    const otherToken = makeCsrfToken(config.sessionSecret);

    const res = await sam.send('POST', '/todos', {
      body: { text: 'Wrong handshake' },
      withCsrf: false,
      headers: { 'x-csrf-token': otherToken },
    });
    assert.equal(res.status, 403);
  });

  it('blocks a made-up token that was not signed with our secret', async () => {
    makeTestApp();
    const forged = makeCsrfToken('not-our-secret');

    const res = await sendRequest('POST', '/auth/login', {
      body: { username: 'sam', password: 'whatever-123' },
      headers: { cookie: `csrf_token=${forged}`, 'x-csrf-token': forged },
    });
    assert.equal(res.status, 403);
  });

  it('allows the change when the handshake is right', async () => {
    makeTestApp();
    const sam = await signUp('sam');
    const res = await sam.post('/todos', { text: 'Good handshake' });
    assert.equal(res.status, 201);
  });

  it('does not need a token just to read', async () => {
    makeTestApp();
    const sam = await signUp('sam');
    const res = await sam.get('/todos');
    assert.equal(res.status, 200);
  });
});
