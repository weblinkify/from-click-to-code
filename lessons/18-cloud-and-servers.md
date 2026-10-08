# Lesson 18 · Cloud and servers: renting a computer that never sleeps ☁️

Right now the app runs on *your* computer. When you close the laptop, it
stops, and nobody else in the world can reach it. To share it, we need a
**server**: a computer that's always on and connected to the internet.

"**The cloud**" just means **other people's computers** that you rent. Big
companies run huge buildings full of them, called **data centres**.

It's like the difference between cooking at home and renting a stall at a
market: the market gives you a spot, electricity and customers walking by, and
you bring your recipe.

## Packing the app: containers

Different computers have different setups. "It works on my machine!" is the
oldest problem in programming. The fix is a **container**: a sealed lunchbox
holding the app *and everything it needs*.

```
   Dockerfile (the recipe)  ──docker build──>  Image (the packed lunchbox)
                                                     │
                                          docker run │  (open and eat!)
                                                     ▼
                                               Container (running app)
                                               ┌─────────────────────┐
                                               │ Node.js 22          │
                                               │ express, bcrypt...  │
                                               │ backend/ frontend/  │
                                               │ listening on :3000  │
                                               └─────────────────────┘
```

- [`Dockerfile`](../Dockerfile): the recipe. Read the comments! It builds in
  two stages, runs as a normal user (not the all-powerful *root*), and checks
  `/health` every 30 seconds.
- [`docker-compose.yml`](../docker-compose.yml): starts the container with the
  right settings using one command, and keeps the database in a **volume**
  (a storage box outside the container) so todos survive restarts.
- [`.dockerignore`](../.dockerignore): what *not* to pack (like secrets and tests).

## From your laptop to the world

```
                        ┌─────────────── the cloud ──────────────────┐
   👧 a user            │                                            │
   types the URL ──────>│  🔒 load balancer ─────>  📦 container      │
                        │   (handles HTTPS,         (our app)        │
                        │    the front desk)           │             │
                        │                              ▼             │
                        │                         🗄️ database disk   │
                        │  🔑 secret store ──> SESSION_SECRET        │
                        └────────────────────────────────────────────┘
```

A real deployment ([see the notes in `ci.yml`](../.github/workflows/ci.yml)):

1. CI builds the image and uploads it to a **container registry** (a library
   of images).
2. The cloud service starts a container from the new image.
3. It waits for `/health` to say "ok" before sending visitors to it. If it
   never does, the old version keeps running!
4. Secrets come from the cloud's **secret store**, not from files.
5. A **load balancer** handles HTTPS, so we set `COOKIE_SECURE=true` and
   `TRUST_PROXY=true` (see [`.env.example`](../.env.example)).

**An honest note:** our app keeps some things on one machine: the SQLite file,
and the login rate-limit counter in memory. That's perfect for one server.
To run *many* copies at once, a real team would move those to shared services
(like PostgreSQL and Redis). Knowing your app's limits is part of the job!

## New words

- **Server**: a computer that answers requests, always on.
- **Cloud**: renting computers in someone else's data centre.
- **Container**: a sealed package of an app plus everything it needs.
- **Image**: the packed container, ready to run.
- **Docker**: the most popular tool for building and running containers.
- **Volume**: storage that lives outside a container, so data survives.
- **Deploy**: putting a new version onto the real server.
- **Load balancer**: a front-desk server that handles HTTPS and shares out visitors.

## Questions

1. What problem do containers solve?
   <details><summary>Answer</summary>
   "It works on my machine." The container carries everything the app needs,
   so it runs the same everywhere.
   </details>

2. Why does the database live in a volume?
   <details><summary>Answer</summary>
   Containers are thrown away and replaced when you update. The volume keeps
   the data safe outside, so your todos survive.
   </details>

## 🛠️ Mini challenge

1. Start the app with `docker compose up --build`. Add a todo.
2. In another terminal, run `docker ps`. After a little while, the STATUS
   column says **(healthy)**. That's the HEALTHCHECK from the Dockerfile!
3. Press Ctrl+C, then `docker compose up` again. Is your todo still there?
   Thank the volume!
4. Bonus: `docker compose exec app whoami`. Which user is the app running as? Why
   not `root`?

---
[← Lesson 17](17-ci-cd.md) · Next: [Lesson 19 · After deployment →](19-after-deployment.md)
