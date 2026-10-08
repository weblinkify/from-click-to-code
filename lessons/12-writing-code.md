# Lesson 12 · Writing code: small pieces with good names ✏️

Code is written **once** but read **many, many times**, by teammates, by
reviewers, and by *you* in a month when you've forgotten everything. So the
best code isn't the cleverest. It's the **clearest**.

Think of building with **Lego**. A huge model is made of small, simple
bricks. Each brick does one job and clicks neatly onto the others. If one
breaks, you swap just that brick.

```
   One giant blob 😵                     Small bricks 😊

  ┌───────────────────────┐           ┌──────────┐ ┌──────────────┐ ┌──────────┐
  │ check text, check id, │           │ validate │ │ app/todos/   │ │ database │
  │ check login, talk to  │    ──>    │ TodoText │→│ route.js     │→│ .js      │
  │ the database, send    │           │          │ │              │ │          │
  │ answer, handle errors │           └──────────┘ └──────────────┘ └──────────┘
  │ ...all in one place   │           each does ONE job, with a clear name
  └───────────────────────┘
```

## Five habits we followed

**1. Names that say what things are.** Compare:

```js
function doIt(a, b) { ... }                  // 😕 do what? what's a?
function validateTodoText(input) { ... }     // 😊 oh, it checks todo text!
```

**2. One job per function.** [`lib/validation.js`](../lib/validation.js)
only checks input. [`lib/db/database.js`](../lib/db/database.js) only
talks to the database. The routes in
[`app/todos/route.js`](../app/todos/route.js) connect them.

**3. Small files.** Each helper has its own file in [`lib/`](../lib), and each
piece of the screen is its own component in [`components/`](../components).
You can read any one of them
in a couple of minutes.

**4. Comments that explain *why*.** Open [`app/todos/route.js`](../app/todos/route.js)
or [`app/(site)/my-todos/page.js`](../app/%28site%29/my-todos/page.js): nearly every line has a short,
plain comment. In everyday projects people comment less, but always explain
anything surprising.

**5. No clever one-liners.** This is short, but it's a puzzle:

```js
const t = x.filter(z => b ? z.c == 1 : true).map(z => ({...z, t: z.t.trim()}));
```

Three plain lines with good names are better than one puzzle.

## Rules written down

Teams write their rules down so everyone codes the same way. Ours are in
[`CLAUDE.md`](../CLAUDE.md), and the **linter** checks some of them
automatically. A **linter** is a spell-checker for code that spots mistakes
like a variable you forgot to use. Ours is ESLint, set up in
[`eslint.config.js`](../eslint.config.js). Run it with `npm run lint`.

## New words

- **Function**: a named set of steps you can use again and again.
- **Variable**: a named box that holds a value.
- **Readable code**: code that's easy for a person to understand.
- **Linter**: a tool that spell-checks code.
- **Refactoring**: tidying code without changing what it does.

## Questions

1. Why is `validateTodoText` a better name than `check`?
   <details><summary>Answer</summary>
   It tells you exactly <i>what</i> is being checked, so you don't have to read
   the code inside to find out.
   </details>

2. What's a linter?
   <details><summary>Answer</summary>
   A tool that reads your code and points out likely mistakes, like a
   spell-checker for code.
   </details>

## 🛠️ Mini challenge

1. Open [`lib/validation.js`](../lib/validation.js) and change
   `MAX_TODO_LENGTH` from `200` to `20`. Save. (If you used `npm run dev`, the
   server restarts by itself.)
2. In the app, try adding a todo with 25 letters. What happens?
3. Now run `npm run test:unit` in a terminal. Some tests fail! They noticed
   your change. **Change it back to 200** and run the tests again: all green ✅.
   (That's [Lesson 13](13-testing.md) in action!)

---
[← Lesson 11](11-database.md) · Next: [Lesson 13 · Testing →](13-testing.md)
