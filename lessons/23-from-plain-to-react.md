# Bonus lesson 23 · From plain JavaScript to React and Next.js 🔁

Here's a secret: this app was built **twice**! First with plain HTML, CSS and
JavaScript (plus a backend library called Express). Then we **rebuilt** it
with **React** and **Next.js**, the tools lots of real companies use.

Why build the same thing twice? Because it's the best way to see *why*
frameworks exist. It's like learning to cook a meal from scratch, then
learning to use a kitchen full of gadgets. Once you've done it by hand, you
understand what the gadgets do for you.

## Both versions are still here

The old version is saved in Git with a **tag** called `v1-plain-html`:

```
  time ──────────────────────────────────────────────────────────────>

  ●──●──●──●──●──●──●──●──●  🏷️ v1-plain-html  ──●──●──●──●──●  main (today)
  └── Chapter 1: plain HTML + JS ──┘             └─ Chapter 2: Next.js + React ┘
```

You can read any old file without changing anything:

```bash
git show v1-plain-html:frontend/app.js
git show v1-plain-html:backend/routes/todos.js
```

## The same todo line, built two ways

**Plain JavaScript** builds the screen step by step, like giving a robot
instructions: *make a box, put a checkbox in it, now put words in it…*

```js
function buildTodoItem(todo) {
  const item = document.createElement('li');
  item.className = 'todo-item';
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = todo.completed;
  checkbox.addEventListener('change', () => setCompleted(todo.id, checkbox.checked));
  const text = document.createElement('span');
  text.textContent = todo.text;
  // ...and the delete button, and then put them all together
}
```

**React** lets you *describe what it should look like*, and React builds it:

```jsx
export default function TodoItem({ todo, onToggle, onDelete }) {
  return (
    <li className={todo.completed ? 'todo-item is-done' : 'todo-item'}>
      <input type="checkbox" checked={todo.completed}
             onChange={(event) => onToggle(todo.id, event.target.checked)} />
      <span className="todo-text">{todo.text}</span>
      <button onClick={() => onDelete(todo.id)}>Delete</button>
    </li>
  );
}
```

👉 The real file: [`components/TodoItem.js`](../components/TodoItem.js).

## What changed, and what stayed the same

| | Chapter 1 (plain) | Chapter 2 (Next.js + React) |
|---|---|---|
| Pages | `frontend/*.html` | [`app/**/page.js`](../app/%28site%29/my-todos/page.js) |
| Drawing the screen | `document.createElement` | React components in [`components/`](../components) |
| Showing text safely | `textContent` | `{todo.text}` (React does it for you) |
| API routes | `backend/routes/*.js` (Express) | [`app/**/route.js`](../app/todos/route.js) |
| Middleware chain | `app.use(...)` in `backend/app.js` | `withApi()` in [`lib/api.js`](../lib/api.js) |
| Security headers | `helmet` | [`proxy.js`](../proxy.js) (with a fresh *nonce* each visit) |
| Styles | `style.css` | Tailwind CSS classes |
| Database, validation, logs | `backend/db`, `backend/validation.js` | **the same code**, moved to [`lib/`](../lib) |
| The API (URLs + status codes) | `/todos`, `/auth/login` … | **exactly the same** |
| Tests | Supertest | a "pretend browser" in [`tests/helpers/test-app.js`](../tests/helpers/test-app.js) |

Notice that **the API and the tests stayed the same**. Every test name from
Chapter 1 still passes in Chapter 2. That's how we *knew* the rebuild didn't
break anything: the tests were our safety net.

## A surprise we found while rebuilding

When we moved to Next.js, a security test we wrote found a **new problem**:
the login rate limit could be dodged by a sneaky visitor writing a fake
`X-Forwarded-For` header (a note that says "I'm calling from address …").
Express used the real address of the connection, but Next.js passes the
visitor's own note along. The fix was to count login tries **per username**
(see `rateLimitKeys` in [`lib/api.js`](../lib/api.js)), and a new test makes
sure it can't come back:
*"a made-up X-Forwarded-For address cannot dodge the limit"* in
[`tests/security/rate-limit.test.js`](../tests/security/rate-limit.test.js).

**Lesson learned:** changing tools can change how security works, so test
again after every big change.

## New words

- **Framework**: a ready-made toolkit that gives a project its shape (Next.js).
- **Library**: a set of tools you call when you need them (React, bcrypt).
- **Rewrite**: building the same thing again, a different way.
- **Tag**: a name stuck on one Git commit, so you can always find it.
- **Declarative**: describing *what* you want (React) instead of every *step*.

## Questions

1. Why did every old test still pass after the rewrite?
   <details><summary>Answer</summary>
   Because the API (the URLs and status codes) stayed exactly the same. Tests
   check <i>what</i> the app does, not <i>how</i> it's built inside.
   </details>

2. In React, how do you show a todo's text safely?
   <details><summary>Answer</summary>
   Just write <code>{todo.text}</code>. React always shows text as plain
   letters. The unsafe way has a scary name on purpose:
   <code>dangerouslySetInnerHTML</code>.
   </details>

3. What security problem did the rewrite reveal?
   <details><summary>Answer</summary>
   The login rate limit trusted a header the visitor could fake. Now tries are
   counted per username, and a test guards it.
   </details>

## 🛠️ Mini challenge

Open two terminal windows in this project. In one, run
`git show v1-plain-html:frontend/app.js | less` and find `buildTodoItem`.
In the other, open [`components/TodoItem.js`](../components/TodoItem.js).
Count the lines in each version. Which one is easier to read? Why do you think
so? (There's no wrong answer, but be ready to explain yours!)

---
[← Lesson 22](22-big-picture.md) · [Back to all lessons](README.md)
