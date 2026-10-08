// SQL injection is when someone types database commands into a text box,
// hoping the app will run them. Because we use "?" placeholders, the
// database treats their words as plain text. Nothing gets run.

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { makeTestApp, makeBrowser, signUp, TEST_PASSWORD } = require('../helpers/test-app');

describe('SQL-looking input', () => {
  it('SQL-looking input is stored as plain text', async () => {
    const { app } = makeTestApp();
    const sam = await signUp(app, 'sam');
    const sqlLookingText = "Robert'); DROP TABLE todos;--";

    const created = await sam.post('/todos', { text: sqlLookingText });
    assert.equal(created.status, 201);

    const list = await sam.get('/todos');
    assert.equal(list.status, 200, 'the todos table must still exist');
    assert.equal(list.body.todos[0].text, sqlLookingText);
  });

  it("a sneaky ' OR '1'='1 username does not log anyone in", async () => {
    const { app } = makeTestApp();
    await signUp(app, 'sam');
    const browser = await makeBrowser(app);

    const res = await browser.post('/auth/login', {
      username: "sam' OR '1'='1",
      password: TEST_PASSWORD,
    });
    assert.equal(res.status, 401);
  });

  it('a filter like ?completed=1 OR 1=1 is rejected', async () => {
    const { app } = makeTestApp();
    const sam = await signUp(app, 'sam');
    const res = await sam.get('/todos?completed=1%20OR%201=1');
    assert.equal(res.status, 400);
  });
});
