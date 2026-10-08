// Security headers and cookie settings.

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { makeTestApp, makeBrowser, TEST_PASSWORD } = require('../helpers/test-app');

function findCookie(res, name) {
  const cookies = res.headers['set-cookie'] || [];
  return cookies.find((cookie) => cookie.startsWith(`${name}=`));
}

describe('security headers', () => {
  it('sends the safety headers on every page', async () => {
    const { api } = makeTestApp();
    const res = await api.get('/');
    assert.match(res.headers['content-security-policy'], /script-src 'self'/);
    assert.equal(res.headers['x-content-type-options'], 'nosniff');
    assert.equal(res.headers['x-frame-options'], 'SAMEORIGIN');
    assert.equal(res.headers['x-powered-by'], undefined, 'we do not brag about using Express');
  });
});

describe('the login cookie', () => {
  it('is HttpOnly and SameSite=Lax', async () => {
    const { app } = makeTestApp();
    const browser = await makeBrowser(app);
    const res = await browser.post('/auth/signup', { username: 'sam', password: TEST_PASSWORD });

    const cookie = findCookie(res, 'sid');
    assert.ok(cookie, 'a session cookie is set');
    assert.match(cookie, /HttpOnly/);
    assert.match(cookie, /SameSite=Lax/);
  });

  it('is Secure when cookieSecure is on (like in production)', async () => {
    const { app } = makeTestApp({ cookieSecure: true });
    // Secure cookies are never sent back over plain http (which tests use),
    // so we copy the CSRF cookie across by hand.
    const csrf = await request(app).get('/auth/csrf');
    assert.match(findCookie(csrf, 'csrf_token'), /Secure/);

    const res = await request(app)
      .post('/auth/signup')
      .set('Cookie', `csrf_token=${csrf.body.csrfToken}`)
      .set('X-CSRF-Token', csrf.body.csrfToken)
      .send({ username: 'sam', password: TEST_PASSWORD });

    assert.equal(res.status, 201);
    assert.match(findCookie(res, 'sid'), /Secure/);
  });
});
