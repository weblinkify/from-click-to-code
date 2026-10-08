# Lesson 11 · The database: the app's filing cabinet 🗄️

When you close the browser, your todos are still there tomorrow. Where do
they live? In a **database**: a program that stores information neatly and
finds it again quickly.

Picture a **filing cabinet**. Each drawer is a **table**. Each card in a
drawer is a **row**. Each card has the same boxes to fill in; those are
**columns**.

## Our three drawers (tables)

```
  users                          sessions                      todos
 ┌────┬──────────┬────────────┐ ┌──────────┬─────────┬──────┐ ┌────┬─────────┬──────────────┬───────────┐
 │ id │ username │ password_  │ │ id       │ user_id │expir…│ │ id │ user_id │ text         │ completed │
 │    │          │ hash       │ ├──────────┼─────────┼──────┤ ├────┼─────────┼──────────────┼───────────┤
 ├────┼──────────┼────────────┤ │ f3a9c1…  │    1 ───┼─┐    │ │ 1  │    1 ───┼─ Feed the cat│     1     │
 │ 1  │ sam      │ $2b$12$Vq… │◄┼──────────┼─────────┼─┘    │ │ 2  │    1    │ Tidy room    │     0     │
 │ 2  │ alex     │ $2b$12$Lp… │ └──────────┴─────────┴──────┘ │ 3  │    2    │ Practise 🎹  │     0     │
 └────┴──────────┴────────────┘                               └────┴─────────┴──────────────┴───────────┘
        ▲                                                                │
        └──────────── user_id says WHO owns each todo ───────────────────┘
```

`user_id` in `todos` points to an `id` in `users`. That link is how we know
todo 3 belongs to alex. It's called a **foreign key**.

👉 The shape of the drawers is in [`lib/db/schema.sql`](../lib/db/schema.sql).
Read the comments: every column is explained.

## Talking to the database: SQL

We ask the database questions in a language called **SQL** (*Structured Query
Language*, often said "sequel"). It reads almost like English:

```sql
SELECT * FROM todos WHERE user_id = ? AND completed = ?
```

*"Get everything from the todos drawer where the owner is (this person) and
it's (done / not done)."*

Those `?` marks are **placeholders**. The real values are handed over
**separately**, so a user's words can never sneak into the command. (See the
[SQL injection bad example](../bad-examples/01-sql-injection.md) for what goes
wrong without them.)

👉 Every question we ask lives in one file, [`lib/db/database.js`](../lib/db/database.js).
No other file talks to the database. That makes it easy to check that every
query is safe.

## Why SQLite?

**SQLite** keeps the whole database in **one file**: `data/todos.db`. There's
no separate database server to set up. That makes it perfect for learning,
and lots of real apps (even phones!) use it too. Bigger apps with many
servers often use **PostgreSQL** or **MySQL**, but the SQL is almost the same.

## New words

- **Database**: a program that stores and finds data.
- **Table**: one kind of thing (users, todos), like a drawer.
- **Row**: one item in a table, like one card.
- **Column**: one piece of information every row has.
- **Primary key**: the unique id of each row.
- **Foreign key**: a column that points to a row in another table.
- **SQL**: the language for asking a database questions.

## Questions

1. Which column tells us who owns a todo?
   <details><summary>Answer</summary><code>user_id</code> in the <code>todos</code> table.</details>

2. Why is `completed` stored as 0 or 1?
   <details><summary>Answer</summary>
   SQLite doesn't have a true/false type, so we use 1 for "done" and 0 for "not
   done". <code>toTodo</code> in <code>database.js</code> turns them back into true and false.
   </details>

3. Why does only one file talk to the database?
   <details><summary>Answer</summary>
   It keeps all the database code in one place, so it's easy to check that
   every query uses placeholders and checks the owner.
   </details>

## 🛠️ Mini challenge

Let's look inside the filing cabinet! (This works when you run the app with
`npm run dev`. macOS and Linux include the `sqlite3` tool.)

```bash
sqlite3 data/todos.db
```

Then type these one at a time:

```sql
.tables
SELECT id, username FROM users;
SELECT * FROM todos;
SELECT password_hash FROM users LIMIT 1;
.quit
```

Can you see your todos? Can you read anyone's real password? (You shouldn't
be able to! 🎉)

---
[← Lesson 10](10-apis.md) · Next: [Lesson 12 · Writing code →](12-writing-code.md)
