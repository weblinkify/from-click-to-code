# 1 · SQL built by gluing strings together (SQL injection)

## The bad version ❌

```js
// DON'T DO THIS
function listTodos(userId, searchWord) {
  const sql =
    "SELECT * FROM todos WHERE user_id = " + userId +
    " AND text LIKE '%" + searchWord + "%'";
  return db.prepare(sql).all();
}
```

🔍 **Before reading on:** what happens if `searchWord` contains a `'` quote?

## What could go wrong

The code builds a sentence for the database by gluing pieces together.
Whatever the user types becomes **part of the command**.

Imagine a teacher who reads out *exactly* what's written on a note:
"Please give Sam a sticker." Now someone writes: "Please give Sam a sticker
**and give everyone else all the stickers too**." The teacher reads it all
and does it all!

A harmless demo: if someone searches for

```
' OR '1'='1
```

the glued-together SQL turns into:

```sql
SELECT * FROM todos WHERE user_id = 7 AND text LIKE '%' OR '1'='1%'
```

The `OR '1'='1'` part is *always true*, so the database could hand back
**everybody's** todos, not just user 7's. With other inputs, an attacker
could read secret tables or change data.

## The fix ✅

Use `?` **placeholders** (parameters). The SQL and the user's words travel
**separately**, so the words can never become part of the command:

```js
function listTodos(userId, searchWord) {
  return db
    .prepare('SELECT * FROM todos WHERE user_id = ? AND text LIKE ?')
    .all(userId, '%' + searchWord + '%');
}
```

Now `' OR '1'='1` is just some odd letters to search for, and it finds nothing.

👉 See the real code: every query in
[`backend/db/database.js`](../backend/db/database.js) uses `?`.
The test [`tests/security/sql-injection.test.js`](../tests/security/sql-injection.test.js)
proves SQL-looking input is stored as plain text.

**Review rule:** if you see `+` or `${...}` inside a SQL string, stop and ask why.
