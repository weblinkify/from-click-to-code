# Lesson 19 · After deployment: watching the dashboard 📊

Hooray, the app is live! 🎉 But the job isn't over. Now we need to know:
*Is it working? Is it fast? Is anything going wrong?* Keeping an eye on a
running app is called **monitoring**.

Think of a **car dashboard**. You don't open the bonnet while driving. You
glance at the speedometer, the fuel gauge and the warning lights. Our app has
its own dashboard, made of three tools:

```
   ┌──────────────────────── the app's dashboard ────────────────────────┐
   │                                                                     │
   │   ❤️ HEALTH                 📈 METRICS               📒 LOGS          │
   │   GET /health              GET /metrics             one JSON line   │
   │   "Am I alive?"            "How am I doing?"        per request     │
   │                                                                     │
   │   {"status":"ok"}          requestsTotal: 152       {"level":"info",│
   │                            errorsTotal:    0         "path":"/todos",│
   │   like a pulse check       todosCreated:  17         "status":200,  │
   │                            loginsFailed:   2         "requestId":…} │
   │                            like a speedometer       like a diary    │
   └─────────────────────────────────────────────────────────────────────┘
```

## ❤️ Health check

[`app/health/route.js`](../app/health/route.js) answers
`GET /health`. It doesn't just say "ok": it actually asks the database a tiny
question (`SELECT 1`). Docker and cloud services call it every few seconds and
raise the alarm if it fails.

## 📈 Metrics

[`lib/metrics.js`](../lib/metrics.js) keeps counters that only go up.
Visit http://localhost:3000/metrics. Watching *changes* matters most: if
`errorsTotal` suddenly jumps, something is wrong. If `loginsFailed` jumps,
maybe a robot is guessing passwords.

## 📒 Logs and request IDs

[`lib/api.js`](../lib/api.js)
writes one line per request. Each request gets a unique **request ID**, sent
back to the browser in the `X-Request-Id` header. When something goes wrong,
the user sees a **help code** (the start of that ID), and we can find the
*exact* log line for their visit. Logs are **structured** (JSON), so a
computer can search them, e.g. *"show every line where status is 500"*.

## Alerts

Nobody stares at a dashboard all day. Real teams set up **alerts**: *"If
/health fails 3 times in a row, text whoever is on call."* That's the next step
up from what we've built.

## New words

- **Monitoring**: keeping watch over a running app.
- **Health check**: a quick "are you alive?" test.
- **Metrics**: numbers that measure how the app is doing.
- **Logs**: the app's diary, one line per event.
- **Request ID**: a unique name tag for one request.
- **Alert**: an automatic message when something looks wrong.
- **Uptime**: how long the app has been running without stopping.

## Questions

1. Why does `/health` ask the database a question instead of just saying "ok"?
   <details><summary>Answer</summary>
   The app could be running but unable to reach its database. That's not
   really healthy! Asking the database makes the check honest.
   </details>

2. A user says "it broke!" and gives help code `3da69b08`. What do you do?
   <details><summary>Answer</summary>
   Search the logs for that request ID, e.g.
   <code>docker compose logs app | grep 3da69b08</code>, to find exactly what
   happened during their visit.
   </details>

## 🛠️ Mini challenge

1. Open http://localhost:3000/metrics in one tab and the app in another.
2. Add three todos. Refresh `/metrics`. Did `todosCreated` go up by 3?
3. In DevTools → **Network**, click any request and find the
   **X-Request-Id** response header. Copy it.
4. Find that exact request in the logs:
   - with Docker: `docker compose logs app | grep PASTE-ID-HERE`
   - with `npm run dev`: look in the terminal running the app.

---
[← Lesson 18](18-cloud-and-servers.md) · Next: [Lesson 20 · Incident drill →](20-incident-drill.md)
