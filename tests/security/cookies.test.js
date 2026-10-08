// The login cookie ("wristband") must carry its safety settings.
// (The security HEADERS are checked in a real browser, in tests/e2e/security-headers.spec.js.)

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { makeTestApp, makeBrowser, TEST_PASSWORD } from '../helpers/test-app.js';

function findCookie(res, name) {
  return res.cookies.find((cookie) => cookie.startsWith(`${name}=`));
}

describe('the login cookie', () => {
  it('is HttpOnly and SameSite=Lax', async () => {
    makeTestApp();
    const browser = await makeBrowser();
    const res = await browser.post('/auth/signup', { username: 'sam', password: TEST_PASSWORD });

    const cookie = findCookie(res, 'sid');
    assert.ok(cookie, 'a session cookie is set');
    assert.match(cookie, /HttpOnly/);
    assert.match(cookie, /SameSite=Lax/);
    assert.doesNotMatch(cookie, /Secure/, 'not Secure on plain http in development');
  });

  it('is Secure when cookieSecure is on (like in production)', async () => {
    makeTestApp({ cookieSecure: true });
    const browser = await makeBrowser();
    const res = await browser.post('/auth/signup', { username: 'sam', password: TEST_PASSWORD });

    assert.equal(res.status, 201);
    assert.match(findCookie(res, 'sid'), /Secure/);
  });

  it('is deleted when you log out', async () => {
    makeTestApp();
    const browser = await makeBrowser();
    await browser.post('/auth/signup', { username: 'sam', password: TEST_PASSWORD });
    const res = await browser.post('/auth/logout');

    assert.match(findCookie(res, 'sid'), /Max-Age=0/);
  });
});
