// Tests for signing up, logging in and logging out.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { makeTestApp, makeBrowser, signUp, TEST_PASSWORD } from '../helpers/test-app.js';

describe('signing up', () => {
  it('a new user can sign up and is logged in straight away', async () => {
    makeTestApp();
    const browser = await makeBrowser();

    const res = await browser.post('/auth/signup', { username: 'sam', password: TEST_PASSWORD });
    assert.equal(res.status, 201);
    assert.equal(res.body.user.username, 'sam');

    const me = await browser.get('/auth/me');
    assert.equal(me.status, 200);
    assert.equal(me.body.user.username, 'sam');
  });

  it('never sends the password hash back', async () => {
    makeTestApp();
    const browser = await makeBrowser();
    const res = await browser.post('/auth/signup', { username: 'sam', password: TEST_PASSWORD });
    assert.deepEqual(Object.keys(res.body.user).sort(), ['id', 'username']);
  });

  it('says 409 when the username is already taken', async () => {
    makeTestApp();
    await signUp('sam');
    const browser = await makeBrowser();

    const res = await browser.post('/auth/signup', { username: 'SAM', password: TEST_PASSWORD });
    assert.equal(res.status, 409);
  });

  it('says 400 when the password is too short', async () => {
    makeTestApp();
    const browser = await makeBrowser();
    const res = await browser.post('/auth/signup', { username: 'sam', password: 'short' });
    assert.equal(res.status, 400);
  });

  it('says 400 when the username has spaces in it', async () => {
    makeTestApp();
    const browser = await makeBrowser();
    const res = await browser.post('/auth/signup', { username: 'sam smith', password: TEST_PASSWORD });
    assert.equal(res.status, 400);
  });
});

describe('logging in and out', () => {
  it('logs in with the right password', async () => {
    makeTestApp();
    await signUp('sam');
    const browser = await makeBrowser();

    const res = await browser.post('/auth/login', { username: 'sam', password: TEST_PASSWORD });
    assert.equal(res.status, 200);
    assert.equal((await browser.get('/todos')).status, 200);
  });

  it('says 401 for a wrong password', async () => {
    makeTestApp();
    await signUp('sam');
    const browser = await makeBrowser();

    const res = await browser.post('/auth/login', { username: 'sam', password: 'wrong-password' });
    assert.equal(res.status, 401);
  });

  it('gives the same message for an unknown user and a wrong password', async () => {
    makeTestApp();
    await signUp('sam');
    const browser = await makeBrowser();

    const wrongPassword = await browser.post('/auth/login', { username: 'sam', password: 'nope-nope' });
    const unknownUser = await browser.post('/auth/login', { username: 'nobody', password: 'nope-nope' });
    assert.equal(unknownUser.status, 401);
    assert.equal(unknownUser.body.error, wrongPassword.body.error);
  });

  it('after logging out, the todos are locked again', async () => {
    makeTestApp();
    const sam = await signUp('sam');

    const res = await sam.post('/auth/logout');
    assert.equal(res.status, 200);
    assert.equal((await sam.get('/todos')).status, 401);
    assert.equal((await sam.get('/auth/me')).status, 401);
  });
});
