// XSS ("cross-site scripting") is when someone sneaks code into text,
// hoping a browser will run it. We store the text exactly as typed and
// the frontend always shows it with textContent, so it stays harmless text.

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { makeTestApp, signUp } = require('../helpers/test-app');

const SCRIPT_TEXT = '<script>alert("hi")</script>';

describe('script tags in todos', () => {
  it('todo text with <script> is shown as text, not run', async () => {
    const { app } = makeTestApp();
    const sam = await signUp(app, 'sam');

    const created = await sam.post('/todos', { text: SCRIPT_TEXT });
    assert.equal(created.status, 201);

    const list = await sam.get('/todos');
    // It comes back as JSON data, exactly the same letters, not as a web page.
    assert.match(list.headers['content-type'], /application\/json/);
    assert.equal(list.body.todos[0].text, SCRIPT_TEXT);
  });

  it('the frontend never puts text on the page with innerHTML', () => {
    const appJs = fs.readFileSync(path.join(__dirname, '../../frontend/app.js'), 'utf8');
    const codeWithoutComments = appJs.replace(/\/\/.*$/gm, '');
    assert.equal(codeWithoutComments.includes('innerHTML'), false);
    assert.equal(codeWithoutComments.includes('insertAdjacentHTML'), false);
    assert.equal(codeWithoutComments.includes('document.write'), false);
  });
});
