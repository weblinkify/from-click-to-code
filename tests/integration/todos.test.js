// Integration tests check that the pieces work TOGETHER:
// a real request goes through the routes, into the database, and back.

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { makeTestApp, makeBrowser, signUp } from '../helpers/test-app.js';

describe('the todos API when logged out', () => {
  it('logged-out user gets 401', async () => {
    makeTestApp();
    const browser = await makeBrowser();

    const list = await browser.get('/todos');
    assert.equal(list.status, 401);

    const create = await browser.post('/todos', { text: 'Sneaky todo' });
    assert.equal(create.status, 401);
  });
});

describe('the todos API when logged in', () => {
  let sam;

  beforeEach(async () => {
    makeTestApp();
    sam = await signUp('sam');
  });

  it('starts with an empty list', async () => {
    const res = await sam.get('/todos');
    assert.equal(res.status, 200);
    assert.deepEqual(res.body.todos, []);
  });

  it('logged-in user can create a todo', async () => {
    const res = await sam.post('/todos', { text: 'Feed the cat' });
    assert.equal(res.status, 201);
    assert.equal(res.body.todo.text, 'Feed the cat');
    assert.equal(res.body.todo.completed, false);
  });

  it('shows a new todo in the list', async () => {
    await sam.post('/todos', { text: 'Feed the cat' });
    const res = await sam.get('/todos');
    assert.equal(res.body.todos.length, 1);
    assert.equal(res.body.todos[0].text, 'Feed the cat');
  });

  it('says 400 when the todo is empty', async () => {
    const res = await sam.post('/todos', { text: '   ' });
    assert.equal(res.status, 400);
  });

  it('says 400 when the todo is too long', async () => {
    const res = await sam.post('/todos', { text: 'a'.repeat(201) });
    assert.equal(res.status, 400);
  });

  it('says 400 when the request is broken JSON', async () => {
    const res = await sam.send('POST', '/todos', {
      rawBody: '{"text": oops',
      headers: { 'content-type': 'application/json' },
    });
    assert.equal(res.status, 400);
  });

  it('can mark a todo complete', async () => {
    const created = await sam.post('/todos', { text: 'Tidy room' });
    const id = created.body.todo.id;

    const res = await sam.put(`/todos/${id}`, { completed: true });
    assert.equal(res.status, 200);
    assert.equal(res.body.todo.completed, true);
  });

  it('can change the words of a todo', async () => {
    const created = await sam.post('/todos', { text: 'Tidy room' });
    const id = created.body.todo.id;

    const res = await sam.put(`/todos/${id}`, { text: 'Tidy my whole room' });
    assert.equal(res.status, 200);
    assert.equal(res.body.todo.text, 'Tidy my whole room');
  });

  it('says 400 when an update sends nothing to change', async () => {
    const created = await sam.post('/todos', { text: 'Tidy room' });
    const res = await sam.put(`/todos/${created.body.todo.id}`, {});
    assert.equal(res.status, 400);
  });

  it('only shows finished todos when asked with ?completed=true', async () => {
    const first = await sam.post('/todos', { text: 'Done thing' });
    await sam.post('/todos', { text: 'Not done thing' });
    await sam.put(`/todos/${first.body.todo.id}`, { completed: true });

    const res = await sam.get('/todos?completed=true');
    assert.equal(res.status, 200);
    assert.deepEqual(res.body.todos.map((todo) => todo.text), ['Done thing']);
  });

  it('only shows unfinished todos when asked with ?completed=false', async () => {
    const first = await sam.post('/todos', { text: 'Done thing' });
    await sam.post('/todos', { text: 'Not done thing' });
    await sam.put(`/todos/${first.body.todo.id}`, { completed: true });

    const res = await sam.get('/todos?completed=false');
    assert.deepEqual(res.body.todos.map((todo) => todo.text), ['Not done thing']);
  });

  it('says 400 for a silly filter like ?completed=banana', async () => {
    const res = await sam.get('/todos?completed=banana');
    assert.equal(res.status, 400);
  });

  it('can delete a todo', async () => {
    const created = await sam.post('/todos', { text: 'Old idea' });
    const id = created.body.todo.id;

    const res = await sam.delete(`/todos/${id}`);
    assert.equal(res.status, 200);

    const list = await sam.get('/todos');
    assert.deepEqual(list.body.todos, []);
  });

  it('says 404 when deleting a todo that does not exist', async () => {
    const res = await sam.delete('/todos/999');
    assert.equal(res.status, 404);
  });

  it('says 404 when changing a todo that does not exist', async () => {
    const res = await sam.put('/todos/999', { completed: true });
    assert.equal(res.status, 404);
  });

  it('says 400 when the id is not a number', async () => {
    const res = await sam.delete('/todos/abc');
    assert.equal(res.status, 400);
  });
});
