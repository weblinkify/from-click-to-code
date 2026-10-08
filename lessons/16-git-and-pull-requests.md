# Lesson 16 · Git and pull requests: save points and asking to merge 🌳

**Git** is a tool that remembers **every version** of your project. Each time
you save a version, it's called a **commit**. You can always look back, see
what changed, and even go back in time.

It's like **save points in a video game** 🎮. Before the hard level, you save.
If things go wrong, you load your save and try again.

## This project's own history

This app was built in phases, one commit each. You can see them with:

```bash
git log --oneline
```

```
  ● Phase 7: lessons and the finished README
  ● Phase 6: bad-examples folder for code review practice
  ● Phase 5: Docker image, docker compose and GitHub Actions CI
  ● Phase 4: logs, metrics, health check and the BREAK_DATABASE drill
  ● Phase 3: accounts, sessions, CSRF and private todos
  ● Phase 2: frontend pages (HTML, CSS, vanilla JS)
  ● Phase 1: database and todos API with tests
  ● Start the project: add .gitignore and README
```

Read it from the bottom up and you can follow the whole story of the app!

## Branches: trying things safely

A **branch** is a separate line of work. The `main` branch is the "real"
version. New work happens on a **feature branch**, so `main` stays safe while
you experiment.

```
  main      ●──────●─────────────────────────●   ← merged!
                    \                       /
  feature/           ●───●───●───●───●────●
  kids-todo-app      P1  P2  P3  P4  P5  P6
```

## Pull requests: "please add my work"

When your branch is ready, you open a **pull request** (PR) on GitHub. It says:
*"Here are my changes. Please review them and pull them into `main`."*

1. The PR shows exactly what changed (green = added, red = removed).
2. Teammates **review** it ([Lesson 14](14-code-review.md)).
3. The **CI robot** runs all the tests ([Lesson 17](17-ci-cd.md)).
4. When everyone's happy ✅, it's **merged** into `main`.

## Good commit messages

A commit message explains **what** changed and **why**:

| 😕 Unhelpful | 😊 Helpful |
|-------------|-----------|
| `stuff` | `Add a rate limit to login so robots can't guess passwords` |
| `fix` | `Fix todos list showing other users' todos` |

## What Git should NOT save

[`.gitignore`](../.gitignore) lists files Git must skip: downloaded libraries
(`node_modules/`), the database file, and **`.env` with its secrets**.

## New words

- **Git**: a tool that saves every version of a project.
- **Commit**: one saved version, with a message.
- **Repository (repo)**: a project tracked by Git.
- **Branch**: a separate line of work.
- **Merge**: joining a branch's changes into another branch.
- **Pull request (PR)**: asking for your branch to be reviewed and merged.
- **Revert**: making a new commit that undoes an old one.

## Questions

1. Why work on a branch instead of directly on `main`?
   <details><summary>Answer</summary>
   So <code>main</code> always works. You can experiment on a branch, and only
   merge once it's reviewed and tested.
   </details>

2. Why is `.env` in `.gitignore`?
   <details><summary>Answer</summary>
   It holds secrets. Anything committed to Git (and pushed to GitHub) can be
   seen by others and stays in the history forever.
   </details>

## 🛠️ Mini challenge

In a terminal in this project:

1. `git log --oneline`: read the story from the bottom up.
2. `git show --stat HEAD~4`: which files did that phase add?
3. Make a branch and a change of your own:
   ```bash
   git switch -c my-first-change
   # edit the welcome text in frontend/index.html
   git add frontend/index.html
   git commit -m "Make the welcome message more exciting"
   git log --oneline -3
   ```
4. Go back to the main version: `git switch main`. Your change disappears
   from the file… but it's safe on your branch!

---
[← Lesson 15](15-security-review.md) · Next: [Lesson 17 · CI/CD →](17-ci-cd.md)
