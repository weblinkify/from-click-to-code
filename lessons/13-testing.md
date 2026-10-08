# Lesson 13 · Testing: checking our work, automatically 🧪

Every time we change the code, something *else* might break by accident. We
could click through the whole app after every change… but that's slow and
we'd forget things. Instead, we write **tests**: small programs that check
the app for us, in seconds, every time.

It's like **checking a cake** while you bake. You taste the batter (a small
check), check the oven temperature (do the parts work together?), and finally
eat a slice (does the whole thing work?).

## The testing pyramid

```
                 /\
                /  \        End-to-end (E2E)          tests/e2e/
               / 🌐 \       A robot uses a REAL browser: slow but complete
              /──────\
             /        \     Integration               tests/integration/
            /   🔗     \    Real requests through the app and database
           /────────────\
          /              \  Unit                      tests/unit/
         /     🧱         \ One small piece on its own: super fast
        /──────────────────\
             + Security tests (tests/security/): can someone break in?
```

Lots of fast tests at the bottom, a few slow ones at the top.

## Tests that read like sentences

Each test name says what *should* happen, in plain words:

| Kind | Example test | File |
|------|--------------|------|
| Unit | *"rejects an empty todo"* | [`tests/unit/validation.test.js`](../tests/unit/validation.test.js) |
| Unit | *"rejects a todo longer than 200 characters"* | same file |
| Integration | *"logged-in user can create a todo"* | [`tests/integration/todos.test.js`](../tests/integration/todos.test.js) |
| Integration | *"logged-out user gets 401"* | same file |
| Security | *"user A cannot delete user B's todo (403/404)"* | [`tests/security/authorization.test.js`](../tests/security/authorization.test.js) |
| Security | *"login is rate limited after too many tries"* | [`tests/security/rate-limit.test.js`](../tests/security/rate-limit.test.js) |
| E2E | *"a kid can sign up, log in, add a todo, complete it and delete it"* | [`tests/e2e/happy-path.spec.js`](../tests/e2e/happy-path.spec.js) |
| Resilience | *"frontend shows a friendly message when the server is down"* | [`tests/e2e/server-down.spec.js`](../tests/e2e/server-down.spec.js) |
| Security (E2E) | *"pages carry a Content-Security-Policy with a fresh nonce each visit"* | [`tests/e2e/security-headers.spec.js`](../tests/e2e/security-headers.spec.js) |
| Course (E2E) | *"security lab: every trick is blocked"* | [`tests/e2e/course.spec.js`](../tests/e2e/course.spec.js) |

## How a test is built

Every test follows three steps: **Arrange, Act, Assert** (set up, do it,
check it).

```js
it('rejects an empty todo', () => {
  const result = validateTodoText('');   // Act: try an empty todo
  assert.equal(result.ok, false);        // Assert: it must say "not ok"
});
```

Each test gets a **fresh, empty database**, so tests never mess each other
up. See `makeTestApp` in [`tests/helpers/test-app.js`](../tests/helpers/test-app.js).

There's a neat trick in that helper: a **pretend browser**. It hands requests
straight to our route files (like `app/todos/route.js`), exactly as Next.js
would, and remembers cookies between requests like a real browser. That way
hundreds of checks run in a couple of seconds, without starting a server.
The end-to-end tests then start the *real* app and use a *real* browser, to
prove everything also works together.

## Running the tests

```bash
npm test              # unit + integration + security (a few seconds)
npm run test:e2e      # the robot browser (needs Playwright installed)
```

A ✅ means the rule holds. A ❌ means something's broken, and the test
name tells you *what*.

## New words

- **Test**: code that checks other code works.
- **Unit test**: checks one small piece alone.
- **Integration test**: checks pieces working together.
- **End-to-end (E2E) test**: checks the whole app like a real user.
- **Assert**: "this must be true, or the test fails".
- **Regression**: something that used to work but broke again.

## Questions

1. Why have lots of unit tests but only a few E2E tests?
   <details><summary>Answer</summary>
   Unit tests are tiny and fast, so you can run hundreds in a second. E2E
   tests open a real browser, which is much slower, so we save them for the
   most important journeys.
   </details>

2. What does "Arrange, Act, Assert" mean?
   <details><summary>Answer</summary>
   Set things up, do the thing you're testing, then check the result is
   what you expected.
   </details>

## 🛠️ Mini challenge

1. Run `npm test` and count the ✅ (or look for `# pass` at the end).
2. Open [`tests/unit/validation.test.js`](../tests/unit/validation.test.js) and
   **write your own test**: *"accepts a todo that is exactly one character"*.
   Copy the shape of the others. Run `npm run test:unit`. Is it green?
3. Bonus: run `npx playwright test --headed` to *watch* the robot use the app!

---
[← Lesson 12](12-writing-code.md) · Next: [Lesson 14 · Code review →](14-code-review.md)
