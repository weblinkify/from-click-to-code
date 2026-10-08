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

  it('serves the login page, todos page, course pages, scripts and styles', async () => {
    const { api } = makeTestApp();
    const files = [
      '/login.html', '/todos.html', '/app.js', '/style.css',
      '/course/', '/course/url.html', '/course/https.html', '/course/course.js', '/course/course.css',
    ];
    for (const file of files) {
      const res = await api.get(file);
      assert.equal(res.status, 200, `${file} should be served`);
    }
  });
});
