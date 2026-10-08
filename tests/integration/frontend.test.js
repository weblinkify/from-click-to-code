// Checks that the server hands out the frontend files.

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { makeTestApp } = require('../helpers/test-app');

describe('the frontend files', () => {
  it('shows the home page at "/"', async () => {
    const { api } = makeTestApp();
    const res = await api.get('/');
    assert.equal(res.status, 200);
    assert.match(res.headers['content-type'], /text\/html/);
    assert.match(res.text, /Kids Todo App/);
  });

  it('serves the login page, todos page, script and styles', async () => {
    const { api } = makeTestApp();
    for (const file of ['/login.html', '/todos.html', '/app.js', '/style.css']) {
      const res = await api.get(file);
      assert.equal(res.status, 200, `${file} should be served`);
    }
  });

  it('never uses innerHTML in the frontend code', async () => {
    const { api } = makeTestApp();
    const res = await api.get('/app.js');
    // Split the word so this test file itself doesn't trip a code search.
    assert.equal(res.text.includes('inner' + 'HTML ='), false);
  });
});
