// app/todos/route.js
// This file is the "todo counter" of our restaurant.
// In Next.js, a file called route.js answers requests for its folder's
// address. This one lives in app/todos/, so it answers /todos.
//
//   GET    /todos   -> "show me my list"
//   POST   /todos   -> "add this to my list"
//
// (Changing and deleting ONE todo lives next door, in app/todos/[id]/route.js.)
//
// Each answer comes with a "status code", a number that says how it went:
//   200 = OK, here you go        201 = Created something new
//   400 = Your request was wrong 401 = Please log in first
//
// Before our code runs, withApi (lib/api.js) has already checked your
// wristband, so call.user tells us WHO is asking.
//
// SAFETY: we pass call.user.id to EVERY database call. That way you can
// only ever see or change your OWN todos.

import { withApi, reply } from '../../lib/api.js';
import { validateTodoText, validateCompletedFilter } from '../../lib/validation.js';

// ---------- GET /todos : show the list ----------
async function listMyTodos(call) {
  // Read the optional ?completed=true part of the URL.
  const searchParams = new URL(call.request.url).searchParams;
  // Turn the words "true" / "false" into real true / false.
  const filter = validateCompletedFilter(searchParams.get('completed') ?? undefined);
  // If it says something odd, like ?completed=banana, say so.
  if (!filter.ok) {
    // 400 means: "I can't do this, your request has a mistake in it."
    return reply(400, { error: filter.error });
  }

  // Ask the database for THIS user's todos only.
  const todos = call.context.db.listTodos(call.user.id, { completed: filter.value });
  // 200 = OK. Send the list back as JSON (a text format computers share).
  return reply(200, { todos });
}

// ---------- POST /todos : add a new todo ----------
async function addTodo(call) {
  // call.body is the package the frontend sent us.
  // Check the todo text BEFORE we save anything.
  const text = validateTodoText(call.body.text);
  // Empty or too long? Send a friendly 400 back.
  if (!text.ok) {
    return reply(400, { error: text.error });
  }

  // Save it, labelled with this user's id as the owner.
  // The database gives back the new todo, with its own id number.
  const todo = call.context.db.createTodo(call.user.id, text.value);
  // Add one to the "todos created" counter on our dashboard (/metrics).
  call.context.metrics.increment('todosCreated');
  // 201 = Created. Something new now exists.
  return reply(201, { todo });
}

// Next.js looks for functions named after the HTTP method.
// requireLogin: true means "members only".
export const GET = withApi(listMyTodos, { requireLogin: true });
export const POST = withApi(addTodo, { requireLogin: true });
