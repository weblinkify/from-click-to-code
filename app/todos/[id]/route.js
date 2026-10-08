// app/todos/[id]/route.js
// The square brackets in the folder name [id] mean "any value goes here".
// So this file answers /todos/1, /todos/2, /todos/42 ...
// and call.params.id tells us which number was in the address.
//
//   PUT    /todos/:id   -> "change this one" (tick it off, or new words)
//   DELETE /todos/:id   -> "throw this one away"
//
// SAFETY: if you ask for someone else's todo, we say 404 "not found", as if
// it doesn't exist at all, so we don't even reveal that it's there.

import { withApi, reply } from '../../../lib/api.js';
import { validateTodoText, validateCompleted, validateTodoId } from '../../../lib/validation.js';

// The same "not found" answer for "no such todo" and "not yours".
function notFound() {
  return reply(404, { error: 'Todo not found.' });
}

// ---------- PUT /todos/:id : change a todo ----------
async function changeTodo(call) {
  // Turn the "7" from the address into the number 7.
  const id = validateTodoId(call.params.id);
  if (!id.ok) {
    return reply(400, { error: id.error });
  }

  // We collect the changes we are allowed to make here.
  const changes = {};

  // Did they send new words? Check them like we do when adding.
  if (call.body.text !== undefined) {
    const text = validateTodoText(call.body.text);
    if (!text.ok) {
      return reply(400, { error: text.error });
    }
    changes.text = text.value;
  }

  // Did they tick it off (or un-tick it)? It must be true or false.
  if (call.body.completed !== undefined) {
    const completed = validateCompleted(call.body.completed);
    if (!completed.ok) {
      return reply(400, { error: completed.error });
    }
    changes.completed = completed.value;
  }

  // If they sent nothing we understand, there's nothing to change.
  if (Object.keys(changes).length === 0) {
    return reply(400, { error: 'Send "text" or "completed" to change a todo.' });
  }

  // Ask the database to make the change, but only if this user owns it.
  const todo = call.context.db.updateTodo(call.user.id, id.value, changes);
  // Not found, or not yours? Either way it's a 404.
  if (!todo) {
    return notFound();
  }
  // 200 = OK, and here's how the todo looks now.
  return reply(200, { todo });
}

// ---------- DELETE /todos/:id : remove a todo ----------
async function deleteTodo(call) {
  const id = validateTodoId(call.params.id);
  if (!id.ok) {
    return reply(400, { error: id.error });
  }

  // Ask the database to delete it, but only if this user owns it.
  const deleted = call.context.db.deleteTodo(call.user.id, id.value);
  // Not found, or not yours? Either way it's a 404.
  if (!deleted) {
    return notFound();
  }
  // 200 = OK, it's gone.
  return reply(200, { deleted: true });
}

export const PUT = withApi(changeTodo, { requireLogin: true });
export const DELETE = withApi(deleteTodo, { requireLogin: true });
