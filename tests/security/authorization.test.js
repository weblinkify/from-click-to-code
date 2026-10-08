// Authorization = "what are you ALLOWED to do?"
// Rule: you can only see and change YOUR OWN todos.

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { makeTestApp, signUp } from '../helpers/test-app.js';

describe('keeping todos private', () => {
  let alice;
  let bob;
  let bobsTodoId;

  beforeEach(async () => {
    makeTestApp();
    alice = await signUp('alice');
    bob = await signUp('bob');
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
