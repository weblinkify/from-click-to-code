# Lesson 2 · Requirements: what does "done" mean? 📋

We have an idea. But "a todo app" could mean a hundred different things! Before
writing any code, builders write down **requirements**: exactly what the app
must do.

It's like a recipe card. "Make a cake" isn't enough. You need to know what
kind, how big, and how to tell when it's baked.

## User stories

A **user story** describes a feature from the point of view of the person
using it. It always has the same shape:

> **As a** *(who)*, **I want** *(what)*, **so that** *(why)*.

Here are ours:

| # | User story |
|---|------------|
| 1 | As a **new visitor**, I want to **sign up**, so that I can have my own list. |
| 2 | As a **user**, I want to **log in**, so that I can get back to my list. |
| 3 | As a **user**, I want to **add a todo**, so that I don't forget it. |
| 4 | As a **user**, I want to **tick off a todo**, so that I can see what I've finished. |
| 5 | As a **user**, I want to **delete a todo**, so that my list stays tidy. |
| 6 | As a **user**, I want **only me** to see my todos, so that my list stays private. |

## Acceptance criteria

A story says *what* we want. **Acceptance criteria** say *how we'll know it's
finished*. They're like the checklist a teacher uses to mark a project.

Story 3, "add a todo", has these:

- ✅ A todo must have **some text**. An empty one is rejected.
- ✅ A todo can be **at most 200 characters** long.
- ✅ Spaces at the start and end are **trimmed** (removed).
- ✅ After adding, the new todo **appears in my list**.
- ✅ Nobody else can see it.

```
   User story                Acceptance criteria             Tests
  ┌──────────────┐          ┌───────────────────────┐      ┌──────────────────────┐
  │ "As a user,  │  ----->  │ - not empty           │ ---> │ "rejects an empty    │
  │  I want to   │          │ - max 200 characters  │      │  todo"               │
  │  add a todo" │          │ - trimmed             │      │ "rejects a todo      │
  └──────────────┘          └───────────────────────┘      │  longer than 200..." │
                                                           └──────────────────────┘
```

See that last arrow? Every acceptance criterion becomes a **test**: a small
program that checks the rule automatically. (More in [Lesson 13](13-testing.md).)

## Where requirements live in this project

- [`backend/validation.js`](../backend/validation.js): the "1 to 200
  characters, trimmed" rule turned into code (`validateTodoText`).
- [`tests/unit/validation.test.js`](../tests/unit/validation.test.js): the
  tests named after the criteria, like *"rejects an empty todo"* and
  *"rejects a todo longer than 200 characters"*.
- [`tests/security/authorization.test.js`](../tests/security/authorization.test.js):
  story 6 as a test, *"user A cannot delete user B's todo"*.

## New words

- **Requirement**: something the app *must* do.
- **User story**: a requirement written from the user's point of view.
- **Acceptance criteria**: the checklist that says when a story is done.
- **Validation**: checking that input follows the rules before using it.

## Questions

1. Turn this into a user story: *a user wants to change the words of a todo
   because they made a typo.*
   <details><summary>Answer</summary>
   "As a <b>user</b>, I want to <b>edit a todo's text</b>, so that <b>I can fix
   mistakes</b>." (Our app can do this! It's <code>PUT /todos/:id</code>.)
   </details>

2. Why is "a todo can be at most 200 characters" better than "todos shouldn't
   be too long"?
   <details><summary>Answer</summary>
   Because it's exact. Everyone (and every test) can check it. "Too long" means
   different things to different people.
   </details>

## 🛠️ Mini challenge

Open the app, log in, and try to break the rules:

1. Add a todo that is **only spaces**. What message do you see?
2. Try typing a really long sentence, more than 200 letters. The box stops
   you! That's a check in the **frontend** (`maxlength="200"` in
   [`frontend/todos.html`](../frontend/todos.html)). The backend checks
   again too, in case someone skips our page. You'll see why in
   [Lesson 9](09-frontend-backend.md).
3. Add `   hello   ` with spaces around it. Look closely: were the spaces kept?

Then find the message you saw in step 1 inside
[`backend/validation.js`](../backend/validation.js).

---
[← Lesson 1](01-the-idea.md) · Next: [Lesson 3 · The UI →](03-ui.md)
