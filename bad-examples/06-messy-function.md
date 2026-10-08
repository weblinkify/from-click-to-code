# 6 · The messy function

## The bad version ❌

```js
// DON'T DO THIS
async function doIt(a, b, c) {
  const x = await db.prepare('SELECT * FROM todos WHERE user_id = ?').all(a);
  let y = x.filter(z => b ? z.completed == 1 : true).map(z => ({...z, t: z.text.trim().substring(0, c || 200)}));
  if (y.length > 0) { log(y.length); return y } else return y;
}
```

🔍 **Before reading on:** list everything that makes this hard to work with.

## What's wrong with it

Nothing here is a *security* hole. But messy code is where bugs hide, and
the next person (maybe you, next month) can't safely change it.

| Problem | Why it hurts |
|---------|--------------|
| `doIt`, `a`, `b`, `c`, `x`, `y`, `z` | Names that say nothing. What is `c`? |
| `b ? ... : true` | You can't tell what `b` means without reading everything |
| One giant line | Hard to read, hard to test, hard to review |
| `==` instead of `===` | Loose comparison can surprise you |
| `substring(0, c \|\| 200)` | Silently chops text instead of rejecting it |
| `if ... return y else return y` | Both branches do the same thing, which is confusing |
| No error handling | If the database fails, the error escapes with no clue for anyone |
| `await` on something that isn't async | Misleading: it suggests the call is async when it isn't |

It's like a recipe that says: "Do it with a, b and c. Then the thing."

## The fix ✅

Split it into small, well-named pieces:

```js
// Get one user's todos, optionally only the finished ones.
function listTodos(userId, { onlyCompleted = false } = {}) {
  const rows = db
    .prepare('SELECT * FROM todos WHERE user_id = ? ORDER BY id')
    .all(userId);

  if (onlyCompleted) {
    return rows.filter((row) => row.completed === 1);
  }
  return rows;
}
```

- Each name says what it **is**.
- The option is named (`onlyCompleted`), so the caller reads like a sentence:
  `listTodos(7, { onlyCompleted: true })`.
- Text length is checked when the todo is **saved** (see
  [`backend/validation.js`](../backend/validation.js)), so we never chop it here.
- Errors aren't hidden. They travel up to the one place that handles them all,
  [`backend/middleware/error-handler.js`](../backend/middleware/error-handler.js),
  which logs the details and sends the user a calm message.

👉 Compare with the real [`backend/db/database.js`](../backend/db/database.js)
and [`backend/routes/todos.js`](../backend/routes/todos.js).

**Review rule:** if you have to read a line three times, ask the author to
split it up and give things better names. That's not being mean; it's
helping the next reader.
