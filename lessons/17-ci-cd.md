# Lesson 17 · CI/CD: the robot that checks every change 🤖

Imagine if every time you finished your homework, a robot instantly
spell-checked it, checked your maths, and made sure you'd answered every
question. That's **CI**!

- **CI = Continuous Integration.** Every time someone pushes code, a robot
  automatically runs all the checks.
- **CD = Continuous Delivery (or Deployment).** When all the checks pass,
  the robot can also put the new version onto the real server.

## Our robot's checklist

Our CI runs on **GitHub Actions**, GitHub's robot service. The instructions
are in [`.github/workflows/ci.yml`](../.github/workflows/ci.yml):

```
   git push
      │
      ▼
  ┌─────────────────────────────── job: test ───────────────────────────────┐
  │ install  ─>  lint  ─>  unit tests  ─>  integration  ─>  security  ─>  npm audit │
  └──────────────────────────────────┬──────────────────────────────────────┘
                     ┌───────────────┴───────────────┐
                     ▼                               ▼
          ┌──── job: e2e ─────┐           ┌──── job: docker ──────┐
          │ install Chromium  │           │ build the image       │
          │ run Playwright    │           │ start it, ask /health │
          └─────────┬─────────┘           └───────────┬───────────┘
                    └───────────────┬─────────────────┘
                                    ▼
                         ┌── job: deploy ──┐
                         │ (switched off;  │
                         │  read the notes)│
                         └─────────────────┘
```

| Step | What it checks |
|------|----------------|
| **Install** (`npm ci`) | Gets the *exact* library versions from `package-lock.json` |
| **Lint** | Spell-checks the code |
| **Tests** | All our unit, integration and security tests |
| **npm audit** | Do any libraries we use have known security holes? |
| **E2E** | A robot browser does the whole sign up → delete journey |
| **Docker build** | The app can be packaged, and it starts up healthy |

If any step fails, GitHub shows a red ❌ on the pull request, and we know
*before* anything reaches real users. All green ✅? Safe to merge.

## The deploy step (switched off)

At the bottom of [`ci.yml`](../.github/workflows/ci.yml) there's a
**commented-out** `deploy` job. It's switched off because this project
doesn't have a real cloud account, but the comments explain each step a real
deployment would take. Read them! (More in [Lesson 18](18-cloud-and-servers.md).)

## New words

- **CI (Continuous Integration)**: automatically checking every change.
- **CD (Continuous Delivery/Deployment)**: automatically releasing checked changes.
- **Pipeline**: the chain of steps the robot runs.
- **Job**: one group of steps (ours: test, e2e, docker).
- **GitHub Actions**: GitHub's service that runs pipelines.
- **Workflow**: the file describing a pipeline.

## Questions

1. Why run the checks on *every* push, not just once before a release?
   <details><summary>Answer</summary>
   Small problems are easiest to fix when they're new. If the robot checks
   every change, you know exactly which change broke something.
   </details>

2. What does `npm audit` look for?
   <details><summary>Answer</summary>
   Libraries (other people's code we use) that have known security problems.
   </details>

## 🛠️ Mini challenge

1. Open this project on GitHub and click the **Actions** tab. Find the latest
   run. Click into it and open a job to read the robot's log. Can you find
   the line where the tests pass?
2. Run the same checks on your own computer, just like the robot:
   ```bash
   npm ci && npm run lint && npm test && npm audit --audit-level=high
   ```
3. Bonus (on a branch!): break a test on purpose, push the branch, and
   watch CI turn red ❌. Then fix it and watch it turn green ✅.

---
[← Lesson 16](16-git-and-pull-requests.md) · Next: [Lesson 18 · Cloud and servers →](18-cloud-and-servers.md)
