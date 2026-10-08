# Lesson 10 · APIs: the menu the kitchen understands 📜

An **API** (*Application Programming Interface*) is the list of things one
program can ask another program to do, and how to ask.

In our restaurant, the API is **the menu**. You can't walk into the kitchen
and say "make me something purple". You order from the menu, in the way the
menu says, and you get back exactly what it promises.

## Our menu

| Method | Path | What it does | Good answer |
|--------|------|--------------|-------------|
| `GET` | `/todos` | List my todos | `200` |
| `GET` | `/todos?completed=true` | List my finished todos | `200` |
| `POST` | `/todos` | Add a todo | `201` |
| `PUT` | `/todos/:id` | Change a todo (words or done) | `200` |
| `DELETE` | `/todos/:id` | Delete a todo | `200` |
| `POST` | `/auth/signup` | Make an account | `201` |
| `POST` | `/auth/login` | Log in | `200` |
| `POST` | `/auth/logout` | Log out | `200` |
| `GET` | `/health` | "Are you alive?" | `200` |
| `GET` | `/metrics` | "How are you doing?" | `200` |

The **method** is the *kind* of order:

- **GET**: "Please give me…" (only reads, changes nothing)
- **POST**: "Here's something new…"
- **PUT**: "Please change this…"
- **DELETE**: "Please throw this away."

## A real order, step by step

```
   Frontend (app.js)                                    Backend (routes/todos.js)

   POST /todos                                      ┌─> is the user logged in?   no → 401
   Content-Type: application/json                   │   is the handshake right?  no → 403
   X-CSRF-Token: 4be1...                  ──────────┤   is the text OK?          no → 400
                                                    │   save it in the database
   {"text": "Feed the cat"}                         └─> 201 Created
                                          <──────────
                                          {"todo": {"id": 3, "text": "Feed the cat",
                                                    "completed": false, ...}}
```

The data travels as **JSON** (*JavaScript Object Notation*), a tidy way to
write information that both people and computers can read:

```json
{ "todo": { "id": 3, "text": "Feed the cat", "completed": false } }
```

## Status codes: how did it go?

| Code | Meaning | When our app uses it |
|------|---------|----------------------|
| **200** | OK | Here's what you asked for |
| **201** | Created | Your new todo or account was made |
| **400** | Bad Request | Your order has a mistake (empty todo, too long…) |
| **401** | Unauthorized | Please log in first |
| **403** | Forbidden | Security handshake failed |
| **404** | Not Found | No such todo (or it isn't yours!) |
| **409** | Conflict | That username is taken |
| **429** | Too Many Requests | Too many login tries, so wait |
| **500** | Server Error | Something broke in the kitchen (our fault) |
| **503** | Unavailable | The health check failed |

A handy rule: **2xx = 🙂 worked, 4xx = 🤔 your mistake, 5xx = 😵 our mistake.**

👉 The whole menu is built in [`backend/routes/todos.js`](../backend/routes/todos.js)
and [`backend/routes/auth.js`](../backend/routes/auth.js). The frontend
orders from it with `callApi` in [`frontend/app.js`](../frontend/app.js).

## New words

- **API**: the menu of things a program can be asked to do.
- **Endpoint**: one item on the menu (a method + a path).
- **HTTP method**: the kind of request: GET, POST, PUT or DELETE.
- **JSON**: a simple text format for sharing data.
- **Status code**: a number saying how a request went.

## Questions

1. Which method would you use to tick off a todo?
   <details><summary>Answer</summary><code>PUT /todos/:id</code> with <code>{"completed": true}</code>.</details>

2. Is a 404 the user's fault or the server's?
   <details><summary>Answer</summary>The user's (it's a 4xx). They asked for something that isn't there.</details>

3. Why does asking for someone else's todo give 404 and not "that's not yours"?
   <details><summary>Answer</summary>
   So nobody can even find out that the todo exists. To them, it simply isn't there.
   </details>

## 🛠️ Mini challenge

Open DevTools → **Network** and add a todo called *"API detective"*.

1. Find the **POST /todos** request. What's its status code?
2. Click **Payload** (or **Request**): find the JSON you sent.
3. Click **Response**: what `id` did the server give your todo?
4. Now tick it off. Find the **PUT** request. What's at the end of its URL?

---
[← Lesson 9](09-frontend-backend.md) · Next: [Lesson 11 · The database →](11-database.md)
