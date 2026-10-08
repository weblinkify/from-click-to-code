// XSS ("cross-site scripting") is when someone sneaks code into text,
// hoping a browser will run it. We store the text exactly as typed, and
// React always shows text as plain letters, so it stays harmless.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { makeTestApp, signUp } from '../helpers/test-app.js';

const SCRIPT_TEXT = '<script>alert("hi")</script>';

// Every JavaScript file in a folder (and the folders inside it).
function codeFilesIn(folder) {
  const files = [];
  for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
    const fullPath = path.join(folder, entry.name);
    if (entry.isDirectory()) {
      files.push(...codeFilesIn(fullPath));
    } else if (entry.name.endsWith('.js')) {
      files.push(fullPath);
    }
  }
  return files;
}

describe('script tags in todos', () => {
  it('todo text with <script> is shown as text, not run', async () => {
    makeTestApp();
    const sam = await signUp('sam');

    const created = await sam.post('/todos', { text: SCRIPT_TEXT });
    assert.equal(created.status, 201);

    const list = await sam.get('/todos');
    // It comes back as JSON data, exactly the same letters, not as a web page.
    assert.match(list.headers['content-type'], /application\/json/);
    assert.equal(list.body.todos[0].text, SCRIPT_TEXT);
  });

  it('the frontend never puts raw HTML on the page', () => {
    const root = path.join(import.meta.dirname, '../..');
    const files = [...codeFilesIn(path.join(root, 'app')), ...codeFilesIn(path.join(root, 'components'))];
    // Split the words so this test file itself doesn't trip a code search.
    const dangerous = ['dangerously' + 'SetInnerHTML', 'inner' + 'HTML', 'insertAdjacent' + 'HTML', 'document.' + 'write'];

    for (const file of files) {
      const code = fs.readFileSync(file, 'utf8').replace(/\/\/.*$/gm, '');
      for (const word of dangerous) {
        assert.equal(code.includes(word), false, `${path.relative(root, file)} uses ${word}`);
      }
    }
  });
});
