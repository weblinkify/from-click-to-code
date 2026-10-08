# Lesson 8 · Security: locks on every door 🔐

Most people are kind. But a website is open to the *whole world*, and a few
people (and lots of robots!) will try to break in. **Security** means building
the app so their tricks don't work.

Think of a castle. It doesn't have just one wall: there's a moat, a wall, a
gate, guards and a locked treasure room. If one defence fails, the next one
still protects you. This is called **defence in depth**.

```
   🌍 the internet
        │
   ┌────▼──────────────────────────────────────────────┐
   │ 🧱 Security headers   (helmet, in app.js)          │
   │  ┌───────────────────────────────────────────────┐ │
   │  │ 🚦 Rate limit on login   (rate-limit.js)      │ │
   │  │  ┌──────────────────────────────────────────┐ │ │
   │  │  │ 🤝 CSRF handshake        (csrf.js)        │ │ │
   │  │  │  ┌─────────────────────────────────────┐ │ │ │
   │  │  │  │ 🎟️ Login check   (require-login.js) │ │ │ │
   │  │  │  │  ┌────────────────────────────────┐ │ │ │ │
   │  │  │  │  │ ✅ Input checks (validation.js) │ │ │ │ │
   │  │  │  │  │  ┌───────────────────────────┐ │ │ │ │ │
   │  │  │  │  │  │ 👤 Owner check + ? SQL    │ │ │ │ │ │
   │  │  │  │  │  │    (database.js)    💎    │ │ │ │ │ │
   │  │  │  │  │  └───────────────────────────┘ │ │ │ │ │
   │  │  │  │  └────────────────────────────────┘ │ │ │ │
   │  │  │  └─────────────────────────────────────┘ │ │ │
   │  │  └──────────────────────────────────────────┘ │ │
   │  └───────────────────────────────────────────────┘ │
   └────────────────────────────────────────────────────┘
```

## Our 12 defences

| # | Defence | Stops… | Where |
|---|---------|--------|-------|
| 1 | Passwords hashed with bcrypt | Stolen passwords | [`routes/auth.js`](../backend/routes/auth.js) |
| 2 | HttpOnly, Secure, SameSite cookies | Stolen or misused wristbands | [`middleware/sessions.js`](../backend/middleware/sessions.js) |
| 3 | CSRF handshake | Other sites acting as you | [`middleware/csrf.js`](../backend/middleware/csrf.js) |
| 4 | Owner check on every query | Seeing or changing others' todos | [`db/database.js`](../backend/db/database.js) |
| 5 | Input validation | Weird or huge input | [`validation.js`](../backend/validation.js) |
| 6 | `?` placeholders in SQL | SQL injection | [`db/database.js`](../backend/db/database.js) |
| 7 | `textContent`, never `innerHTML` | XSS (sneaky scripts) | [`frontend/app.js`](../frontend/app.js) |
| 8 | Rate limit on login | Password-guessing robots | [`middleware/rate-limit.js`](../backend/middleware/rate-limit.js) |
| 9 | Security headers (helmet) | Lots of browser tricks | [`app.js`](../backend/app.js) |
| 10 | Secrets in `.env` | Leaked keys | [`.env.example`](../.env.example), [`.gitignore`](../.gitignore) |
| 11 | Generic error messages | Giving attackers clues | [`middleware/error-handler.js`](../backend/middleware/error-handler.js) |
| 12 | `npm audit` in CI | Libraries with known holes | [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) |

Every defence has a comment in plain words right next to it in the code. Go
and read one!

## The CSRF handshake, explained

This one's tricky, so here's a story. You're logged in to our app. You visit
a sneaky website. It has a hidden form that sends `DELETE /todos/1` to *our*
site. Your browser helpfully attaches your cookies, and your todo is gone! 😱

Our fix: every change must include a **secret handshake token** in a special
header. Our page can read the token; the sneaky site can't. No token, no
change. The answer is **403 Forbidden**.

## New words

- **Attacker**: someone trying to misuse the app.
- **Defence in depth**: many layers of protection, not just one.
- **Vulnerability**: a weakness an attacker could use.
- **CSRF**: tricking your browser into sending a request you didn't mean to send.
- **Rate limiting**: only allowing a few tries in a period of time.

## Questions

1. Why have *many* defences instead of one really good one?
   <details><summary>Answer</summary>
   Nobody's perfect. If one defence has a mistake in it, the others still
   protect the treasure. That's defence in depth.
   </details>

2. What answer code do you get after too many wrong logins?
   <details><summary>Answer</summary>
   <b>429 Too Many Requests</b>. You have to wait before trying again.
   </details>

## 🛠️ Mini challenge

1. Open http://localhost:3000, then DevTools → **Network**, refresh, click the
   first request and look at **Response Headers**. Find
   `Content-Security-Policy` and `X-Frame-Options`. Those are helmet's work!
2. On the login page, type a wrong password **six times**. What message
   appears on the sixth try? (Then wait 15 minutes, or restart the app, to try
   again.)
3. Open http://localhost:3000/metrics. Did `loginsFailed` go up?

---
[← Lesson 7](07-login.md) · Next: [Lesson 9 · Frontend and backend →](09-frontend-backend.md)
