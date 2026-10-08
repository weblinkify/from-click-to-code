# 3 · No owner check on `DELETE /todos/:id`

## The bad version ❌

```js
// DON'T DO THIS
router.delete('/:id', requireLogin, (req, res) => {
  db.prepare('DELETE FROM todos WHERE id = ?').run(req.params.id);
  res.status(200).json({ deleted: true });
});
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
router.delete('/:id', requireLogin, (req, res) => {
  const result = db
    .prepare('DELETE FROM todos WHERE id = ? AND user_id = ?')
    .run(req.params.id, req.user.id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Todo not found.' });
  }
  res.status(200).json({ deleted: true });
});
```

We answer **404 "not found"** rather than "403 not yours", so Alice can't
even find out that todo 42 exists.

👉 See the real code: `deleteTodo` in [`backend/db/database.js`](../backend/db/database.js)
and the routes in [`backend/routes/todos.js`](../backend/routes/todos.js).
Test: [`tests/security/authorization.test.js`](../tests/security/authorization.test.js).

**Review rule:** for every query that touches a todo, find the `user_id = ?`.
