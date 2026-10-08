# 3 · No owner check on `DELETE /todos/:id`

## The bad version ❌

```js
// DON'T DO THIS  (app/todos/[id]/route.js)
async function deleteTodo(call) {
  const id = Number(call.params.id);
  db.prepare('DELETE FROM todos WHERE id = ?').run(id);
  return reply(200, { deleted: true });
}

export const DELETE = withApi(deleteTodo, { requireLogin: true });
```

🔍 **Before reading on:** the user *is* logged in. So what's missing?

## What could go wrong

This code checks **who you are** (you're logged in), but not **what you're
allowed to do**. These are two different questions:

| Question | Big word | Like… |
|----------|----------|-------|
| Who are you? | **Authentication** | Showing your library card |
| Are you allowed to do *this*? | **Authorization** | Only borrowing books on *your* card |

Todo ids are just counting numbers: 1, 2, 3… If Alice's todo is number 41,
Bob's might be number 42. Alice could simply send:

```
DELETE /todos/42
```

…and Bob's todo is gone. She didn't hack anything clever; she just changed a
number. This mistake is so common it has a name: **IDOR** (Insecure Direct
Object Reference).

## The fix ✅

Always include the owner in the query. Then "id 42 **that belongs to Alice**"
simply doesn't exist:

```js
async function deleteTodo(call) {
  const id = Number(call.params.id);
  const result = db
    .prepare('DELETE FROM todos WHERE id = ? AND user_id = ?')
    .run(id, call.user.id);

  if (result.changes === 0) {
    return reply(404, { error: 'Todo not found.' });
  }
  return reply(200, { deleted: true });
}
```

We answer **404 "not found"** rather than "403 not yours", so Alice can't
even find out that todo 42 exists.

👉 See the real code: `deleteTodo` in [`lib/db/database.js`](../lib/db/database.js)
and the route in [`app/todos/[id]/route.js`](../app/todos/[id]/route.js).
Test: [`tests/security/authorization.test.js`](../tests/security/authorization.test.js).

**Review rule:** for every query that touches a todo, find the `user_id = ?`.
