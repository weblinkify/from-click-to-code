# Rules for working in this repo

This is a **teaching** project. A parent uses it to show a 10-year-old how a
real web app is built. Clarity beats cleverness every time.

## Stack (keep it boring)
- Next.js 16 (App Router) + React 19, written in plain JavaScript (ES modules), not TypeScript
- Backend: route handlers in `app/**/route.js`, all wrapped by `withApi()` in `lib/api.js`
- Database: SQLite through `better-sqlite3` (file at `data/todos.db`); all SQL lives in `lib/db/database.js`
- Styling: Tailwind CSS v4 (`app/globals.css`); shared class lists in `lib/ui.js`
- Course: `lib/course/curriculum.js` lists every lesson; written lessons are `lessons/*.md`, rendered with react-markdown
- Tests: `node:test` (unit, integration, security), with Playwright for end-to-end tests
- The plain HTML + Express version lives on in Git at the tag `v1-plain-html`
- **Do not add a dependency without asking first.**

## Code style
- Small files, small functions and clear names. No clever one-liners.
- Every important line in `app/todos/route.js` and `app/(site)/my-todos/page.js`
  (and the components it uses) gets a short comment a 10-year-old could follow.
- Explain each security measure in a comment, in kid-friendly words.
- Only add `'use client'` to components that really need the browser.
- No inline `style={{…}}`: the Content-Security-Policy blocks it. Use Tailwind classes.

## Security rules (never break these)
- SQL: only `?` placeholders. Never build SQL with `+` or template strings.
- Never use `dangerouslySetInnerHTML` or `innerHTML` (a test scans for them).
- Every todo query must check the owner (`WHERE user_id = ?`).
- Never trust `X-Forwarded-For` unless `TRUST_PROXY=true`.
- Users see generic error messages. Details go to the logs only.
- Secrets live in `.env`, which is never committed. Document every new one in `.env.example`.
- `bad-examples/` is for review practice only. **Never import from it.**

## Tests
- Test names read like sentences a child understands ("rejects an empty todo").
- API tests use `makeTestApp()` and the pretend browser from `tests/helpers/test-app.js`.
- Before every commit run `npm run lint && npm test && npm run build`, plus
  `npm run test:e2e` for UI changes and `npm run check:links` after editing lessons.

## Git
- Use one commit per finished step, with a clear message saying *what* and *why*.
- Work on a feature branch and merge to `main` when CI is green.
