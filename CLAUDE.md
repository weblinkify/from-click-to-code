# Rules for working in this repo

This is a **teaching** project. A parent uses it to show a 10-year-old how a
real web app is built. Clarity beats cleverness every time.

## Stack (keep it boring)
- Backend: Node.js 22 + Express 5, CommonJS (`require`)
- Database: SQLite through `better-sqlite3` (file at `data/todos.db`)
- Frontend: plain HTML, CSS and vanilla JS in `frontend/`, with no framework and no build step
- Tests: `node:test` + Supertest, and Playwright for end-to-end tests
- **Do not add a dependency without asking first.**

## Code style
- Small files, small functions and clear names. No clever one-liners.
- Every important line in `backend/routes/todos.js` and `frontend/app.js` gets a
  short comment that a 10-year-old could follow.
- Explain each security measure in a comment, in kid-friendly words.

## Security rules (never break these)
- SQL: only `?` placeholders. Never build SQL with `+` or template strings.
- Show user text in the browser with `textContent`. Never use `innerHTML`.
- Every todo query must check the owner (`WHERE user_id = ?`).
- Users see generic error messages. Details go to the logs only.
- Secrets live in `.env`, which is never committed. Document every new one in `.env.example`.
- `bad-examples/` is for review practice only. **Never import from it.**

## Tests
- Test names read like sentences a child understands ("rejects an empty todo").
- Each test builds a fresh app with `makeTestApp()` from `tests/helpers/test-app.js`.
- Run `npm run lint && npm test` before every commit (and `npm run check:links` after editing lessons).

## Git
- Use one commit per finished step, with a clear message saying *what* and *why*.
- Work on a feature branch and merge to `main` through a pull request.
