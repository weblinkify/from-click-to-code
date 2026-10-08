# Lesson 9 · Frontend and backend: the dining room and the kitchen 🍽️

Every web app has two halves. A **restaurant** is the perfect picture:

- The **dining room** is the **frontend**: what customers see. Tables, menus,
  nice lights. It runs in **your browser**.
- The **kitchen** is the **backend**: where the real work happens, like
  cooking, the fridge, and the recipes. It runs on **the server**. Customers
  never go in!
- The **waiter** carries orders between them. That's the **API** (next lesson).

```
     FRONTEND (your browser)                    BACKEND (the server)
   ┌──────────────────────────────┐        ┌──────────────────────────────────┐
   │  🪑 dining room               │        │  👩‍🍳 kitchen                       │
   │                              │        │                                  │
   │  app/(site)/my-todos/page.js │  order │  app/todos/route.js  (the chef)  │
   │     (the room)               │ ─────> │  lib/validation.js   (taste test)│
   │  components/TodoItem.js ...  │        │  lib/db/database.js  (the fridge)│
   │  lib/api-client.js           │ <───── │                                  │
   │     (the waiter)             │  food  │  🗄️ data/todos.db                 │
   └──────────────────────────────┘        └──────────────────────────────────┘
        anyone can look at this                 customers can't see in here
```

## One project, two places to run

Our app is built with **Next.js**, a **framework**: a ready-made toolkit that
gives a project its shape, like the frame of a house. In Next.js, the
frontend and backend live **in the same folder**, called `app/`. So how do we
know which code runs where? Next.js has simple rules:

| File | Runs on… | Example |
|------|----------|---------|
| `route.js` | 🖥️ the **server** only (the kitchen) | [`app/todos/route.js`](../app/todos/route.js) |
| `page.js` that starts with `'use client'` | 🌐 the **browser** (the dining room) | [`app/(site)/my-todos/page.js`](../app/%28site%29/my-todos/page.js) |
| `page.js` *without* `'use client'` | 🖥️ built on the server, then sent as finished HTML | [`app/(site)/page.js`](../app/%28site%29/page.js) |
| `lib/` files | wherever they're used (the server ones never reach the browser) | [`lib/db/database.js`](../lib/db/database.js) |

`'use client'` is like a sign on a door saying *"this room is in the dining
room"*. Without it, code stays in the kitchen, where secrets and the database
are safe.

## Why keep them apart?

- **Safety.** Anyone can read the frontend code (try *View Source*!). Secrets
  and the database must stay in the kitchen, where visitors can't reach them.
- **Never trust the dining room.** A customer could scribble on their order.
  So the kitchen **checks everything again**, even if the frontend already
  checked. For example, the todo box in
  [`components/AddTodoForm.js`](../components/AddTodoForm.js) has
  `maxLength={200}`, but [`lib/validation.js`](../lib/validation.js) checks
  again, because someone could skip our page and send a request directly.
- **Different jobs.** Frontend people think about what's easy and pretty;
  backend people think about data and safety. (Many people do both. They're
  called *full-stack* developers!)

## New words

- **Frontend**: the part of the app that runs in your browser.
- **Backend**: the part that runs on the server.
- **Node.js**: a program that lets JavaScript run on a server, not just in browsers.
- **Framework**: a ready-made toolkit that gives a project its shape.
- **Next.js**: the framework our app uses, for both the frontend and the backend.
- **`'use client'`**: the line that tells Next.js "this part runs in the browser".
- **Full-stack**: working on both frontend and backend.

## Questions

1. Why does the backend check todo length when the frontend already does?
   <details><summary>Answer</summary>
   Because anyone can skip the frontend and send requests straight to the
   server. The kitchen never trusts that an order was written properly.
   </details>

2. Where should a secret password for a service go: frontend or backend?
   <details><summary>Answer</summary>
   The backend (in <code>.env</code>). Everything in the frontend can be read by anyone.
   </details>

3. Does `app/todos/route.js` ever run in your browser?
   <details><summary>Answer</summary>
   No! <code>route.js</code> files only run on the server. Your browser can only
   send them requests and read the answers.
   </details>

## 🛠️ Mini challenge

1. On your todos page, right-click → **View Page Source**. That's what the
   server sent to your browser, and anyone can read it.
2. Now try to view the kitchen: visit http://localhost:3000/lib/db/database.js.
   What happens? Why is that a *good* thing?
3. In DevTools → **Sources**, look under `localhost:3000` → `_next`. Somewhere
   in there is the waiter's code from `lib/api-client.js`, packed up by
   Next.js. Can you find the words `X-CSRF-Token`? (Hint: press
   Ctrl+Shift+F, or Cmd+Option+F on a Mac, to search all files.)

---
[← Lesson 8](08-security.md) · Next: [Lesson 10 · APIs →](10-apis.md)
