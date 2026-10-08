// Rate limiting: after too many login tries, you must wait.

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { makeTestApp, makeBrowser, signUp, TEST_PASSWORD } = require('../helpers/test-app');

describe('too many login tries', () => {
  it('login is rate limited after too many tries', async () => {
    const { app } = makeTestApp({ loginMaxAttempts: 3 });
    await signUp(app, 'sam');
    const browser = await makeBrowser(app);

    for (let attempt = 1; attempt <= 3; attempt++) {
      const res = await browser.post('/auth/login', { username: 'sam', password: 'wrong-guess' });
      assert.equal(res.status, 401, `try number ${attempt} is still allowed`);
    }

    const blocked = await browser.post('/auth/login', { username: 'sam', password: TEST_PASSWORD });
    assert.equal(blocked.status, 429);
    assert.ok(blocked.headers['retry-after'], 'it says how long to wait');
  });

  it('lets you try again once the waiting time is over', async () => {
    const { app } = makeTestApp({ loginMaxAttempts: 1, loginWindowMs: 50 });
    await signUp(app, 'sam');
    const browser = await makeBrowser(app);

    await browser.post('/auth/login', { username: 'sam', password: 'wrong-guess' });
    const blocked = await browser.post('/auth/login', { username: 'sam', password: TEST_PASSWORD });
    assert.equal(blocked.status, 429);

    await new Promise((resolve) => setTimeout(resolve, 80));
    const allowed = await browser.post('/auth/login', { username: 'sam', password: TEST_PASSWORD });
    assert.equal(allowed.status, 200);
  });
});
