# Lesson 20 · Incident drill: practising for when things break 🚨

Even the best apps break sometimes. When something goes wrong for real users,
it's called an **incident**. Professionals don't panic; they follow steps
they've **practised**, just like a school fire drill. 🔥

Today we'll break our app **on purpose** and fix it, step by step.

```
   1. DETECT ──> 2. INVESTIGATE ──> 3. FIND THE CAUSE ──> 4. FIX ──> 5. PREVENT ──> 6. LEARN
   "something's    read the logs     "aha, it's the       restart     add a test   write it up
    wrong!"                           database!"           or revert               (no blame)
```

## The drill switch

Our app has a special setting, `BREAK_DATABASE=true`. When it's on, every
database call fails, as if the database had suddenly disappeared. Find it in
[`backend/db/database.js`](../backend/db/database.js) (`checkDatabaseIsWorking`)
and [`backend/config.js`](../backend/config.js).

> 🧑‍🏫 **Grown-ups:** for the full experience, one person breaks the app
> secretly while the learner is the "on-call engineer" who has to work out
> what happened.

---

## Step 0 · Everything is fine

Start the app normally, sign up, and add a couple of todos.

```bash
docker compose up --build          # or: npm run dev
```

Check the pulse: http://localhost:3000/health says `{"status":"ok"}` ✅

## Step 1 · 💥 Break it (the "outage")

Stop the app (Ctrl+C) and start it again with the drill switch on:

```bash
BREAK_DATABASE=true docker compose up        # or: BREAK_DATABASE=true npm start
```

## Step 2 · 🔎 Detect: how do we *know* something's wrong?

Go back to http://localhost:3000/todos.html and refresh. You should see:

> *Something went wrong on our side. Please try again. (Help code: 3da69b08)*

Notice the app didn't show scary technical details, just a calm message and a
help code. Now check the dashboard:

| Check | What you see | Meaning |
|-------|--------------|---------|
| http://localhost:3000/health | `{"status":"unhealthy"}` (status **503**) | The pulse check fails! |
| http://localhost:3000/metrics | `errorsTotal` keeps going up | Lots of 500 errors |
| `docker ps` (wait a minute or two) | **(unhealthy)** | Docker noticed too |

In a real company, an **alert** would now wake up the on-call engineer. 📟

## Step 3 · 📒 Investigate: read the logs

Logs are the app's diary. Look for lines with `"level":"error"`:

```bash
docker compose logs app | grep '"level":"error"'
# or, if you used npm: look in the terminal for lines with "level":"error"
```

You can also search for the **help code** the user saw:

```bash
docker compose logs app | grep 3da69b08
```

You'll find something like:

```json
{"level":"error","message":"request failed","requestId":"3da69b08-...",
 "path":"/todos","error":"SQLITE_CANTOPEN: unable to open database file
 (simulated outage because BREAK_DATABASE=true)"}
```

## Step 4 · 🧩 Find the cause

The log says `SQLITE_CANTOPEN` (the database can't be opened) and tells us
why: `BREAK_DATABASE=true`. Let's find where that comes from:

```bash
grep -rn "BREAK_DATABASE" backend/
```

Also look at the very first log lines from when the app started. There's a
warning there too. 👀 *(In real incidents, the clue is often in the logs from
just before things went wrong.)*

## Step 5 · 🔧 Fix it

**Option A: fix the setting.** Stop the app and start it normally:

```bash
docker compose up        # or: npm run dev
```

Check `/health` says `ok` again. Your todos are still there. 🎉

**Option B: roll back a bad change with `git revert`.** Sometimes the cause is
a code change that just went out. Let's practise that (on a branch!):

```bash
git switch -c drill-bad-deploy

# Make the "bad change": switch the drill on by default.
# In backend/config.js, change:
#     breakDatabase: readBoolean(env.BREAK_DATABASE, false),
# to:
#     breakDatabase: readBoolean(env.BREAK_DATABASE, true),

git commit -am "Tweak config defaults"     # an innocent-looking message!
npm run dev                                 # /health → 503. Broken!
```

Now roll it back. `git revert` makes a **new** commit that undoes the bad one,
so the history still shows what happened:

```bash
git revert HEAD --no-edit
npm run dev                                 # /health → ok again ✅
git log --oneline -3                        # see both commits in the history
```

## Step 6 · 🛡️ Prevent it from happening again

A good fix includes a **test**, so the robot catches it next time. Our app
already has tests for *how it behaves* when the database breaks; see
[`tests/integration/incident.test.js`](../tests/integration/incident.test.js).
But nothing stops someone switching the drill **on by default**, like in
Option B. Your job: write that test!

Create `tests/unit/config.test.js` with a test called
*"the database is not broken unless someone asks for it"*.

<details><summary>Show a solution</summary>

```js
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { readConfig } = require('../../backend/config');

describe('the settings', () => {
  it('the database is not broken unless someone asks for it', () => {
    const config = readConfig({});
    assert.equal(config.breakDatabase, false);
  });
});
```

Run `npm run test:unit`. Then try the "bad change" from Option B again: the
test turns red ❌. CI would block that change before it ever reached users!
</details>

## Step 7 · 📝 Learn: the blameless post-mortem

After an incident, the team writes a short report called a **post-mortem**.
It's **blameless**: we ask *"what let this happen?"*, never *"whose fault is
it?"* People make mistakes; good systems catch them.

Fill this in together:

```
  INCIDENT REPORT
  What happened:      ______________________________________
  When it started:    ______   When it was fixed: ______
  How we noticed:     ______________________________________
  The cause:          ______________________________________
  How we fixed it:    ______________________________________
  How we'll prevent it next time: ___________________________
  What went well:     ______________________________________
```

## New words

- **Incident**: something going wrong for real users.
- **Outage**: when the app (or part of it) stops working.
- **On call**: being the person responsible for responding to alerts.
- **Rollback / revert**: going back to the last version that worked.
- **Post-mortem**: a write-up after an incident, focused on learning.
- **Blameless**: looking for causes in the system, not blaming people.
- **Regression test**: a test that stops an old bug coming back.

## Questions

1. What were the three ways we could *detect* the problem?
   <details><summary>Answer</summary>
   The user saw an error message, <code>/health</code> returned 503, and
   <code>/metrics</code> showed <code>errorsTotal</code> going up (Docker also
   marked the container "unhealthy").
   </details>

2. Why does the user see a help code instead of the real error message?
   <details><summary>Answer</summary>
   Real error details could help an attacker and would confuse users. The help
   code lets us find the full details in the logs, where only we can see them.
   </details>

3. Why is `git revert` better than deleting the bad commit?
   <details><summary>Answer</summary>
   It keeps the history honest: everyone can see what went wrong and how it
   was undone. Deleting history can confuse teammates who already have it.
   </details>

## 🛠️ Mini challenge

Run the whole drill with a timer ⏱️. How long does it take you from *"the
page shows an error"* to *"/health says ok"*? Real teams track this number
(it's called **time to recovery**). Run the drill again next week and see if
you can beat your time!

---
[← Lesson 19](19-after-deployment.md) · Next: [Lesson 21 · Continuous improvement →](21-continuous-improvement.md)
