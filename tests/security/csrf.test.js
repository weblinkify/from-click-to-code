// CSRF protection: changes need the secret handshake token.

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { makeTestApp, signUp } = require('../helpers/test-app');
const { makeCsrfToken } = require('../../backend/middleware/csrf');

describe('the CSRF secret handshake', () => {
  it('blocks a change with no token (403)', async () => {
    const { app } = makeTestApp();
    const sam = await signUp(app, 'sam');

    const res = await sam.agent.post('/todos').send({ text: 'No handshake' });
    assert.equal(res.status, 403);
  });

  it('blocks a change when the header and cookie do not match', async () => {
    const { app, config } = makeTestApp();
    const sam = await signUp(app, 'sam');
    const otherToken = makeCsrfToken(config.sessionSecret);

    const res = await sam.agent
      .post('/todos')
      .set('X-CSRF-Token', otherToken)
      .send({ text: 'Wrong handshake' });
    assert.equal(res.status, 403);
  });

  it('blocks a made-up token that was not signed with our secret', async () => {
    const { app } = makeTestApp();
    const forged = makeCsrfToken('not-our-secret');

    const res = await request(app)
      .post('/auth/login')
      .set('Cookie', `csrf_token=${forged}`)
      .set('X-CSRF-Token', forged)
      .send({ username: 'sam', password: 'whatever-123' });
    assert.equal(res.status, 403);
  });

  it('allows the change when the handshake is right', async () => {
    const { app } = makeTestApp();
    const sam = await signUp(app, 'sam');
    const res = await sam.post('/todos', { text: 'Good handshake' });
    assert.equal(res.status, 201);
  });

  it('does not need a token just to read', async () => {
    const { app } = makeTestApp();
    const sam = await signUp(app, 'sam');
    const res = await sam.agent.get('/todos');
    assert.equal(res.status, 200);
  });
});
