# Lesson 9 · Frontend and backend: the dining room and the kitchen 🍽️

Every web app has two halves. A **restaurant** is the perfect picture:

- The **dining room** is the **frontend**: what customers see. Tables, menus,
  nice lights. It runs in **your browser**.
- The **kitchen** is the **backend**: where the real work happens, like
  cooking, the fridge, and the recipes. It runs on **the server**. Customers
  never go in!
- The **waiter** carries orders between them. That's the **API** (next lesson).

```
     FRONTEND (your browser)               BACKEND (the server)
   ┌──────────────────────────┐        ┌──────────────────────────────┐
   │  🪑 dining room           │        │  👩‍🍳 kitchen                   │
   │                          │        │                              │
   │  todos.html  (the room)  │  order │  routes/todos.js (the chef)  │
   │  style.css   (the decor) │ ─────> │  validation.js   (taste test)│
   │  app.js      (the waiter │        │  db/database.js  (the fridge)│
   │               who takes  │ <───── │                              │
   │               your order)│  food  │  🗄️ todos.db                  │
   └──────────────────────────┘        └──────────────────────────────┘
        anyone can look at this             customers can't see in here
```

## Why split them?

- **Safety.** Anyone can read the frontend code (try *View Source*!). Secrets
  and the database must stay in the kitchen, where visitors can't reach them.
- **Never trust the dining room.** A customer could scribble on their order.
  So the kitchen **checks everything again**, even if the frontend already
  checked. For example, the todo box in `todos.html` has `maxlength="200"`,
  but [`backend/validation.js`](../backend/validation.js) checks again,
  because someone could skip our page and send a request directly.
- **Different jobs.** Frontend people think about what's easy and pretty;
  backend people think about data and safety. (Many people do both. They're
  called *full-stack* developers!)

## Our two folders

| Frontend: [`frontend/`](../frontend) | Backend: [`backend/`](../backend) |
|---|---|
| Runs in the **browser** | Runs on the **server** (Node.js) |
| HTML, CSS, JavaScript | JavaScript (Node.js) + SQL |
| Shows things, reacts to clicks | Checks rules, saves data, keeps secrets |
| Can be read by anyone | Hidden from visitors |

The backend also *hands out* the frontend files. Look for
`express.static(FRONTEND_DIR)` in [`backend/app.js`](../backend/app.js).

## New words

- **Frontend**: the part of the app that runs in your browser.
- **Backend**: the part that runs on the server.
- **Node.js**: a program that lets JavaScript run on a server, not just in browsers.
- **Express**: a library that helps Node.js answer web requests.
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

## 🛠️ Mini challenge

1. On the todos page, right-click → **View Page Source**. That's the frontend
   HTML, and anyone can read it.
2. Now try to view the backend: visit http://localhost:3000/backend/server.js.
   What happens? Why is that a *good* thing?
3. In DevTools → **Sources**, open `app.js` and find the function `addTodo`.
   It's the waiter taking your order!

---
[← Lesson 8](08-security.md) · Next: [Lesson 10 · APIs →](10-apis.md)
