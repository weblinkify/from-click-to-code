# Lesson 21 · Continuous improvement: a little better every week 🌱

An app is never really "finished". People use it, have ideas, find bugs.
The best teams make **small improvements, often**, and learn from each one.

It's like **practising an instrument** 🎹. You don't get good in one giant
practice session. You get good with lots of small sessions, noticing what to
work on each time.

## The improvement loop

```
          ┌──────────────► 1. LISTEN ──────────────┐
          │       (feedback, metrics, logs,        │
          │        incidents, your own ideas)      ▼
   5. LEARN                                  2. PICK ONE small thing
   (did it help?                              (the most useful one)
    check metrics)                                 │
          ▲                                        ▼
          │                               3. BUILD it, with a test
          └──────── 4. SHIP it ◄───────── (review + CI)
                    (deploy)
```

Each trip around the loop is called an **iteration**. Small iterations mean
small risks: if something goes wrong, it's easy to see what and to undo it.

## Where ideas come from

- **Users**: *"I wish I could see how many todos I have left!"*
- **Metrics**: if `loginsFailed` is always high, maybe the login page is confusing.
- **Incidents**: [Lesson 20](20-incident-drill.md) taught us to add a test.
- **Code reviews**: *"This function is getting long. Could we split it?"*
- **Your list from [Lesson 1](01-the-idea.md)!** Find that piece of paper.

## Ideas for this app (pick one!)

| Idea | Size | Files you'd touch |
|------|------|-------------------|
| Show "3 todos left" under the list | 🟢 small | [`app/(site)/my-todos/page.js`](../app/%28site%29/my-todos/page.js) |
| Edit a todo's words by double-clicking it | 🟡 medium | [`components/TodoItem.js`](../components/TodoItem.js) (the API already supports it: `PUT /todos/:id`!) |
| A "delete all finished todos" button | 🟡 medium | `app/todos/route.js`, `lib/db/database.js`, `app/(site)/my-todos/page.js` + tests |
| Due dates | 🟠 bigger | `schema.sql`, `validation.js`, routes, components, tests |
| Keep the login rate limit across restarts | 🟠 bigger | `rate-limit.js`, `schema.sql` |

## Technical debt

Sometimes we take shortcuts to ship faster. That's **technical debt**: like
borrowing money, it's fine for a while, but you must pay it back or it grows.
Our app has a little, written down honestly in [Lesson 18](18-cloud-and-servers.md):
the in-memory rate limiter and counters reset on restart. Good teams keep a
list and pay debts back bit by bit.

## Retrospectives

Every few weeks, teams hold a **retrospective** ("retro"): a short chat about
three questions:

1. 😊 What went well?
2. 🤔 What could be better?
3. 🎯 What one thing will we try next time?

## New words

- **Iteration**: one trip around the build-and-learn loop.
- **Feedback**: what users (and data) tell you about the app.
- **Technical debt**: shortcuts that make future work harder until fixed.
- **Retrospective**: a team chat about how to work better.

## Questions

1. Why are small changes safer than big ones?
   <details><summary>Answer</summary>
   If something breaks, it's easy to tell which change did it, and easy to
   undo. One big change mixes many things together.
   </details>

2. What is technical debt?
   <details><summary>Answer</summary>
   A shortcut that saves time now but makes later work harder, until you
   "pay it back" by doing it properly.
   </details>

## 🛠️ Mini challenge

Do one full trip around the loop with the 🟢 **"3 todos left"** idea:

1. **Pick:** write it as a user story ([Lesson 2](02-requirements.md)).
2. **Build:** on a new branch, open
   [`app/(site)/my-todos/page.js`](../app/%28site%29/my-todos/page.js). Count the todos that
   aren't completed:
   `const todosLeft = todos.filter((todo) => !todo.completed).length;`
   and show it under the list: `<p>{todosLeft} todos left</p>`.
3. **Check:** add a step to [`tests/e2e/happy-path.spec.js`](../tests/e2e/happy-path.spec.js)
   that expects the text, and run `npm run test:e2e`.
4. **Ship:** commit with a helpful message, then (if you're on GitHub) open a
   pull request and watch CI.
5. **Learn:** hold a mini retro. What went well? What was tricky?

---
[← Lesson 20](20-incident-drill.md) · Next: [Lesson 22 · The big picture →](22-big-picture.md)
