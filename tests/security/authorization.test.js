// Authorization = "what are you ALLOWED to do?"
// Rule: you can only see and change YOUR OWN todos.

const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { makeTestApp, signUp } = require('../helpers/test-app');

describe('keeping todos private', () => {
  let alice;
  let bob;
  let bobsTodoId;

  beforeEach(async () => {
    const { app } = makeTestApp();
    alice = await signUp(app, 'alice');
    bob = await signUp(app, 'bob');
    const created = await bob.post('/todos', { text: "Bob's secret plan" });
    bobsTodoId = created.body.todo.id;
  });

  it("user A cannot delete user B's todo (403/404)", async () => {
    const res = await alice.delete(`/todos/${bobsTodoId}`);
    assert.ok([403, 404].includes(res.status), `got ${res.status}`);

    const bobsList = await bob.get('/todos');
    assert.equal(bobsList.body.todos.length, 1, "Bob's todo must still be there");
  });

  it("user A cannot change user B's todo", async () => {
    const res = await alice.put(`/todos/${bobsTodoId}`, { completed: true });
    assert.ok([403, 404].includes(res.status), `got ${res.status}`);

    const bobsList = await bob.get('/todos');
    assert.equal(bobsList.body.todos[0].completed, false);
  });

  it("user A cannot see user B's todos in their list", async () => {
    const res = await alice.get('/todos');
    assert.deepEqual(res.body.todos, []);
  });
});
