# Kids Todo App 📝

[![CI](https://github.com/weblinkify/from-click-to-code/actions/workflows/ci.yml/badge.svg)](https://github.com/weblinkify/from-click-to-code/actions/workflows/ci.yml)

A small, **real** web app for learning how websites work, from an idea all the
way to a server in the cloud.

You can sign up, log in, add a todo, tick it off, and delete it. Every part of
the code is written to be *read*, with simple comments, so a grown-up and a kid
can explore it together. Alongside the app there are **22 short lessons** that
point at the real files.

👉 **Start here after it's running: [the lessons](lessons/README.md)**

---

## 1 · Run the app (the easy way, with Docker)

**Docker** packs the app into a "container" so it runs the same on every
computer. You don't need to install anything else.

1. Install **Docker Desktop**: https://www.docker.com/products/docker-desktop/
   and open it (wait until it says it's running).
2. Download this project. Either click the green **Code → Download ZIP** button
   on GitHub and unzip it, or, if you have Git:
   ```bash
   git clone https://github.com/weblinkify/from-click-to-code.git
   cd from-click-to-code
   ```
3. *(Optional but recommended)* Make your private settings file:
   ```bash
   cp .env.example .env
   ```
   Then open `.env` and replace `replace-me-with-a-long-random-secret` with
   any long jumble of letters and numbers.
4. Start it:
   ```bash
   docker compose up --build
   ```
   The first time takes a few minutes. When you see `"message":"server started"`,
   it's ready.
5. Open **http://localhost:3000** in your web browser. 🎉

To **stop** the app, press `Ctrl + C` in the terminal. Your todos are kept for
next time. To delete everything and start fresh: `docker compose down -v`.

## 2 · Run the app without Docker (for tinkering with the code)

You need **Node.js 22 or newer**: https://nodejs.org (pick the "LTS" version).
Check with `node --version`.

```bash
npm install              # download the libraries (once)
cp .env.example .env     # your private settings (once)
npm run dev              # start the app; it restarts when you save a file
```

Open **http://localhost:3000**. The database is saved in `data/todos.db`.

## 3 · Run the tests

```bash
npm test                         # unit + integration + security tests
npm run lint                     # the code "spell-checker"

npx playwright install chromium  # once: download the robot browser
npm run test:e2e                 # end-to-end tests in a real browser
npx playwright test --headed     # ...and watch the robot click around!
```

---

## What's inside

```
README.md          ← you are here
CLAUDE.md          ← the rules for working on this code
lessons/           ← 22 lessons, from "the idea" to "the big picture"
frontend/          ← what runs in your browser (HTML, CSS, JavaScript)
backend/           ← what runs on the server
  server.js        ← starts the app
  app.js           ← connects all the pieces, in order
  routes/          ← the API: auth.js, todos.js, health.js, metrics.js
  db/              ← schema.sql (the shape of the data) + database.js
  middleware/      ← helpers every request passes: login check, CSRF,
                     rate limit, error handler, request logger…
tests/             ← unit/, integration/, security/, e2e/
bad-examples/      ← code with mistakes on purpose, for review practice
                     (never used by the real app)
.github/workflows/ ← ci.yml: the robot that checks every change
Dockerfile         ← the recipe for the app's container
docker-compose.yml ← starts it all with one command
.env.example       ← a template for your private settings
```

## The API

| Method | Address | What it does |
|--------|---------|--------------|
| `GET` | `/todos` | List my todos (add `?completed=true` or `false` to filter) |
| `POST` | `/todos` | Add a todo: `{"text": "Feed the cat"}` |
| `PUT` | `/todos/:id` | Change a todo: `{"completed": true}` and/or `{"text": "..."}` |
| `DELETE` | `/todos/:id` | Delete a todo |
| `POST` | `/auth/signup` | Make an account: `{"username": "...", "password": "..."}` |
| `POST` | `/auth/login` | Log in |
| `POST` | `/auth/logout` | Log out |
| `GET` | `/auth/me` | Who am I logged in as? |
| `GET` | `/auth/csrf` | Get the security-handshake token |
| `GET` | `/health` | "I'm alive" check |
| `GET` | `/metrics` | Counters: requests, errors, todos created, failed logins |

All `POST`, `PUT` and `DELETE` requests need the `X-CSRF-Token` header (the
frontend handles this for you). See [lesson 10](lessons/10-apis.md).

## All the commands

| Command | What it does |
|---------|--------------|
| `npm start` | Start the app |
| `npm run dev` | Start the app and restart it whenever you save a file |
| `npm test` | Run unit, integration and security tests |
| `npm run test:unit` / `test:integration` / `test:security` | Run one kind of test |
| `npm run test:e2e` | Run the browser tests (Playwright) |
| `npm run lint` | Check the code for mistakes |
| `npm run check:links` | Check every lesson links to real files |
| `docker compose up --build` | Build and start the app in Docker |
| `docker compose logs app` | Read the app's logs (its diary) |
| `docker compose down` | Stop and remove the container (keeps your todos) |

## Settings

Settings live in `.env` (copy it from [`.env.example`](.env.example)). Your
`.env` is **never** saved to Git, because it holds secrets.

| Setting | Default | What it does |
|---------|---------|--------------|
| `PORT` | `3000` | The door number the app listens on |
| `DB_PATH` | `data/todos.db` | Where the database file is saved |
| `SESSION_SECRET` | *(random)* | Secret for signing security tokens. **Set this!** |
| `COOKIE_SECURE` | on in production | Cookies only travel over HTTPS |
| `LOGIN_MAX_ATTEMPTS` / `LOGIN_WINDOW_MINUTES` | `5` / `15` | Login rate limit |
| `BCRYPT_ROUNDS` | `12` | How hard password scrambling works |
| `TRUST_PROXY` | `false` | Set `true` behind a cloud load balancer |
| `BREAK_DATABASE` | `false` | 🚨 Incident drill only: makes the database fail |

## The incident drill 🚨

Practise fixing a broken app, safely:

```bash
BREAK_DATABASE=true docker compose up
```

Then follow [lesson 20](lessons/20-incident-drill.md) step by step: detect it,
read the logs, find the cause, fix it, and add a test.

---

## Troubleshooting

**"Cannot connect to the Docker daemon"**
Docker Desktop isn't running. Open it and wait until it says it's running.

**"port is already allocated" / "EADDRINUSE"**
Something else is using door 3000. Stop the other program, or use another
door: with Docker, change the `ports` line in `docker-compose.yml` to
`"3001:3000"`; without Docker, put `PORT=3001` in `.env`. Then open
http://localhost:3001.

**"This database was made by an older version of the app"**
Your `data/todos.db` is from an early version. Delete it and start again:
`rm data/todos.db` (with Docker: `docker compose down -v`).

**I can't log in and nothing happens**
Make sure you're using **http://localhost:3000** exactly. If you set
`COOKIE_SECURE=true` without HTTPS, browsers drop the login cookie. Remove
it from `.env`.

**"Too many tries. Please wait a few minutes"**
That's the login rate limit doing its job! Wait 15 minutes, or restart the app.

**"The server is taking a nap"**
The app isn't running. Start it again (see above), then refresh the page.

**`npm install` fails while building `better-sqlite3` or `bcrypt`**
Check `node --version` says 22 or newer. If it does, try deleting the
`node_modules` folder and running `npm install` again.

---

## For grown-ups: how this was built

The Git history is part of the lesson. Each phase is one commit:

```bash
git log --oneline
```

Read [lesson 16](lessons/16-git-and-pull-requests.md) to explore it together.
