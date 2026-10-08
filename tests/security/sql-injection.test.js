// SQL injection is when someone types database commands into a text box,
// hoping the app will run them. Because we use "?" placeholders, the
// database treats their words as plain text. Nothing gets run.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { makeTestApp, makeBrowser, signUp, TEST_PASSWORD } from '../helpers/test-app.js';

describe('SQL-looking input', () => {
  it('SQL-looking input is stored as plain text', async () => {
    makeTestApp();
    const sam = await signUp('sam');
    const sqlLookingText = "Robert'); DROP TABLE todos;--";

    const created = await sam.post('/todos', { text: sqlLookingText });
    assert.equal(created.status, 201);

    const list = await sam.get('/todos');
    assert.equal(list.status, 200, 'the todos table must still exist');
    assert.equal(list.body.todos[0].text, sqlLookingText);
  });

  it("a sneaky ' OR '1'='1 username does not log anyone in", async () => {
    makeTestApp();
    await signUp('sam');
    const browser = await makeBrowser();

    const res = await browser.post('/auth/login', {
      username: "sam' OR '1'='1",
      password: TEST_PASSWORD,
    });
    assert.equal(res.status, 401);
  });

  it('a filter like ?completed=1 OR 1=1 is rejected', async () => {
    makeTestApp();
    const sam = await signUp('sam');
    const res = await sam.get('/todos?completed=1%20OR%201=1');
    assert.equal(res.status, 400);
  });
});
