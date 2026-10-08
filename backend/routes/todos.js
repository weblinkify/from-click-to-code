// routes/todos.js
// This file is the "todo counter" of our restaurant.
// The frontend (the customer) sends a request, and here we decide what to do.
//
//   GET    /todos       -> "show me my list"
//   POST   /todos       -> "add this to my list"
//   PUT    /todos/:id   -> "change this one" (tick it off, or new words)
//   DELETE /todos/:id   -> "throw this one away"
//
// Each answer comes with a "status code", a number that says how it went:
//   200 = OK, here you go        201 = Created something new
//   400 = Your request was wrong 404 = Couldn't find that
//
// Before any of this runs, the guard in require-login.js has already
// checked your wristband, so req.user tells us WHO is asking.
//
// SAFETY: we pass req.user.id to EVERY database call. That way you can
// only ever see or change your OWN todos. If you ask for someone else's
// todo, we say 404 "not found", as if it doesn't exist at all, so we
// don't even reveal that it's there.

const express = require('express');
const {
  validateTodoText,
  validateCompleted,
  validateTodoId,
  validateCompletedFilter,
} = require('../validation');

// A small helper so every "you sent something wrong" answer looks the same.
function sendBadRequest(res, message) {
  // 400 means: "I can't do this, your request has a mistake in it."
  res.status(400).json({ error: message });
}

// A small helper for "we looked, but it isn't there".
function sendNotFound(res) {
  // 404 means: "There's no todo with that number."
  res.status(404).json({ error: 'Todo not found.' });
}

function createTodosRouter(db) {
  // A "router" is a mini-app that only handles URLs starting with /todos.
  const router = express.Router();

  // ---------- GET /todos : show the list ----------
  router.get('/', (req, res) => {
    // Read the optional ?completed=true part of the URL.
    const filter = validateCompletedFilter(req.query.completed);
    // If it says something odd, like ?completed=banana, say so.
    if (!filter.ok) {
      return sendBadRequest(res, filter.error);
    }

    // Ask the database for THIS user's todos only.
    const todos = db.listTodos(req.user.id, { completed: filter.value });
    // 200 = OK. Send the list back as JSON (a text format computers share).
    res.status(200).json({ todos });
  });

  // ---------- POST /todos : add a new todo ----------
  router.post('/', (req, res) => {
    // req.body is the package the frontend sent us. It might be empty.
    const body = req.body || {};
    // Check the todo text BEFORE we save anything.
    const text = validateTodoText(body.text);
    // Empty or too long? Send a friendly 400 back.
    if (!text.ok) {
      return sendBadRequest(res, text.error);
    }

    // Save it, labelled with this user's id as the owner.
    // The database gives back the new todo, with its own id number.
    const todo = db.createTodo(req.user.id, text.value);
    // 201 = Created. Something new now exists.
    res.status(201).json({ todo });
  });

  // ---------- PUT /todos/:id : change a todo ----------
  router.put('/:id', (req, res) => {
    // ":id" is the number in the URL, e.g. 7 in /todos/7.
    const id = validateTodoId(req.params.id);
    if (!id.ok) {
      return sendBadRequest(res, id.error);
    }

    const body = req.body || {};
    // We collect the changes we are allowed to make here.
    const changes = {};

    // Did they send new words? Check them like we do when adding.
    if (body.text !== undefined) {
      const text = validateTodoText(body.text);
      if (!text.ok) {
        return sendBadRequest(res, text.error);
      }
      changes.text = text.value;
    }

    // Did they tick it off (or un-tick it)? It must be true or false.
    if (body.completed !== undefined) {
      const completed = validateCompleted(body.completed);
      if (!completed.ok) {
        return sendBadRequest(res, completed.error);
      }
      changes.completed = completed.value;
    }

    // If they sent nothing we understand, there's nothing to change.
    if (Object.keys(changes).length === 0) {
      return sendBadRequest(res, 'Send "text" or "completed" to change a todo.');
    }

    // Ask the database to make the change, but only if this user owns it.
    const todo = db.updateTodo(req.user.id, id.value, changes);
    // Not found, or not yours? Either way it's a 404.
    if (!todo) {
      return sendNotFound(res);
    }
    // 200 = OK, and here's how the todo looks now.
    res.status(200).json({ todo });
  });

  // ---------- DELETE /todos/:id : remove a todo ----------
  router.delete('/:id', (req, res) => {
    const id = validateTodoId(req.params.id);
    if (!id.ok) {
      return sendBadRequest(res, id.error);
    }

    // Ask the database to delete it, but only if this user owns it.
    // It tells us whether anything was removed.
    const deleted = db.deleteTodo(req.user.id, id.value);
    // Not found, or not yours? Either way it's a 404.
    if (!deleted) {
      return sendNotFound(res);
    }
    // 200 = OK, it's gone.
    res.status(200).json({ deleted: true });
  });

  return router;
}

module.exports = { createTodosRouter };
