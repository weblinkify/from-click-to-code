# Lesson 22 · The big picture 🗺️

You made it! 🎉 Let's zoom out and see how **everything** fits together.
It's like looking at a whole town from a hilltop after exploring every street.

## The whole journey of one todo

```
  💡 IDEA ─> 📋 REQUIREMENTS ─> 🎨 UI DESIGN ─> ✏️ CODE ─> 🧪 TESTS ─> 👀 REVIEW
                                                                         │
     ┌───────────────────────────────────────────────────────────────────┘
     ▼
  🌳 GIT + PULL REQUEST ─> 🤖 CI ─> ☁️ DEPLOY ─> 📊 MONITOR ─> 🚨 INCIDENTS ─> 🌱 IMPROVE
                                                                                  │
     ▲                                                                            │
     └──────────────────────────── and around again ──────────────────────────────┘


  When someone adds a todo:

  👧 browser                                                          server 🖥️
  ┌───────────────┐   HTTPS 🔒    ┌──────────────────────────────────────────────┐
  │ todos.html    │  POST /todos  │ request-logger  (gives it an ID, logs it)    │
  │ style.css     │ ────────────> │ helmet          (security headers)          │
  │ app.js        │  + cookie     │ cookies + session (who are you? → sam)       │
  │  callApi()    │  + CSRF token │ csrf            (secret handshake ok?)       │
  │               │               │ requireLogin    (logged in?)                 │
  │               │               │ routes/todos.js (the chef)                   │
  │               │               │   validation.js (1–200 characters?)          │
  │               │               │   database.js   (INSERT ... VALUES (?, ?))   │
  │               │               │        │                                     │
  │               │  201 Created  │        ▼                                     │
  │ textContent ✅ │ <──────────── │   🗄️ todos.db   📈 metrics: todosCreated + 1  │
  └───────────────┘   {"todo":…}  └──────────────────────────────────────────────┘
```

## Every lesson, and where to find it

| Concept | Lesson | Where in this project |
|---------|--------|-----------------------|
| The idea | [01](01-the-idea.md) | [`README.md`](../README.md) |
| Requirements | [02](02-requirements.md) | [`backend/validation.js`](../backend/validation.js) |
| UI | [03](03-ui.md) | [`frontend/`](../frontend) |
| Clicking a URL | [04](04-what-happens-when-you-click.md) | [`backend/app.js`](../backend/app.js) |
| URL parts | [05](05-url-parts.md) | [`backend/config.js`](../backend/config.js) |
| HTTP vs HTTPS | [06](06-http-vs-https.md) | [`backend/middleware/sessions.js`](../backend/middleware/sessions.js) |
| Login | [07](07-login.md) | [`backend/routes/auth.js`](../backend/routes/auth.js) |
| Security | [08](08-security.md) | [`backend/middleware/`](../backend/middleware) |
| Frontend / backend | [09](09-frontend-backend.md) | [`frontend/`](../frontend) and [`backend/`](../backend) |
| APIs | [10](10-apis.md) | [`backend/routes/todos.js`](../backend/routes/todos.js) |
| Database | [11](11-database.md) | [`backend/db/`](../backend/db) |
| Writing code | [12](12-writing-code.md) | [`CLAUDE.md`](../CLAUDE.md), [`eslint.config.js`](../eslint.config.js) |
| Testing | [13](13-testing.md) | [`tests/`](../tests) |
| Code review | [14](14-code-review.md) | [`bad-examples/`](../bad-examples/README.md) |
| Security review | [15](15-security-review.md) | [`tests/security/`](../tests/security) |
| Git and PRs | [16](16-git-and-pull-requests.md) | [`.gitignore`](../.gitignore), `git log` |
| CI/CD | [17](17-ci-cd.md) | [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) |
| Cloud and servers | [18](18-cloud-and-servers.md) | [`Dockerfile`](../Dockerfile), [`docker-compose.yml`](../docker-compose.yml) |
| After deployment | [19](19-after-deployment.md) | [`backend/routes/health.js`](../backend/routes/health.js), [`backend/metrics.js`](../backend/metrics.js) |
| Incidents | [20](20-incident-drill.md) | [`tests/integration/incident.test.js`](../tests/integration/incident.test.js) |
| Improvement | [21](21-continuous-improvement.md) | your next commit! |

## The most important ideas

1. **Start small**, then improve in small steps.
2. **Write down what "done" means**, then test it.
3. **Never trust input**: check it on the server, and keep it as plain text.
4. **Many layers of safety**, because nobody's perfect.
5. **Clear beats clever.** Code is read far more than it's written.
6. **Robots check every change** (tests + CI), so humans can focus on ideas.
7. **Watch the app after it ships**, and practise for when things break.
8. **Mistakes are for learning**, never for blaming.

You now know how real web apps go from a click to code to the cloud and
back. Every app you use, even the giant ones, is built from these same pieces.
Just more of them. 🚀

## Questions

1. Put these in order: *deploy, test, idea, monitor, code, review.*
   <details><summary>Answer</summary>idea → code → test → review → deploy → monitor (and then improve, and around again!)</details>

2. A todo is added. Name three things that check it before it's saved.
   <details><summary>Answer</summary>
   Any three of: the session (are you logged in?), the CSRF handshake,
   <code>requireLogin</code>, <code>validateTodoText</code> (1–200 characters),
   and the database's own <code>CHECK</code> rule in <code>schema.sql</code>.
   </details>

3. Which lesson was your favourite, and why?
   <details><summary>Answer</summary>There's no wrong answer! 😊</details>

## 🛠️ Mini challenge: the grand tour

With the app running and DevTools → **Network** open, add one todo, then
follow its journey through the whole project. Tick each one off:

- [ ] Find the **POST /todos** request and its **X-Request-Id**.
- [ ] Find the **same ID** in the logs.
- [ ] Find the line in [`backend/routes/todos.js`](../backend/routes/todos.js) that saved it.
- [ ] Find your todo in the database with `sqlite3 data/todos.db "SELECT * FROM todos;"`
      (or `docker compose exec app node -e "console.log(require('better-sqlite3')('/app/data/todos.db').prepare('SELECT * FROM todos').all())"` with Docker).
- [ ] See `todosCreated` go up at http://localhost:3000/metrics.
- [ ] Find the test that proves adding a todo works.

Then teach someone else how it works. That's how you know you've really
got it. 🌟

---
[← Lesson 21](21-continuous-improvement.md) · [Back to all lessons](README.md)
