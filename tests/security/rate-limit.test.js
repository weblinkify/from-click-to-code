// Rate limiting: after too many login tries, you must wait.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { makeTestApp, makeBrowser, signUp, TEST_PASSWORD } from '../helpers/test-app.js';

describe('too many login tries', () => {
  it('login is rate limited after too many tries', async () => {
    makeTestApp({ loginMaxAttempts: 3 });
    await signUp('sam');
    const browser = await makeBrowser();

    for (let attempt = 1; attempt <= 3; attempt++) {
      const res = await browser.post('/auth/login', { username: 'sam', password: 'wrong-guess' });
      assert.equal(res.status, 401, `try number ${attempt} is still allowed`);
    }

    const blocked = await browser.post('/auth/login', { username: 'sam', password: TEST_PASSWORD });
    assert.equal(blocked.status, 429);
    assert.ok(blocked.headers['retry-after'], 'it says how long to wait');
  });

  it('a made-up X-Forwarded-For address cannot dodge the limit', async () => {
    makeTestApp({ loginMaxAttempts: 2 });
    await signUp('sam');
    const robot = await makeBrowser();

    const statuses = [];
    for (let attempt = 1; attempt <= 4; attempt++) {
      const res = await robot.send('POST', '/auth/login', {
        body: { username: 'sam', password: 'wrong-guess' },
        headers: { 'x-forwarded-for': `10.0.0.${attempt}` },
      });
      statuses.push(res.status);
    }
    assert.deepEqual(statuses, [401, 401, 429, 429]);
  });

  it('lets you try again once the waiting time is over', async () => {
    makeTestApp({ loginMaxAttempts: 1, loginWindowMs: 50 });
    await signUp('sam');
    const browser = await makeBrowser();

    await browser.post('/auth/login', { username: 'sam', password: 'wrong-guess' });
    const blocked = await browser.post('/auth/login', { username: 'sam', password: TEST_PASSWORD });
    assert.equal(blocked.status, 429);

    await new Promise((resolve) => setTimeout(resolve, 80));
    const allowed = await browser.post('/auth/login', { username: 'sam', password: TEST_PASSWORD });
    assert.equal(allowed.status, 200);
  });
});
