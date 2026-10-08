# Lesson 15 · Security review: thinking like a sneaky person 🕵️

A **security review** is a special code review where you ask one question
over and over:

> *"If I were a sneaky person, how could I misuse this?"*

Security experts call this **threat modelling**. It's like checking your house
before a holiday: is the back door locked? Is a window open? Is the spare key
under the doormat (where everyone looks first)?

## Follow the user's input

The most important trick: **follow anything a user types** and see where it ends up.

```
  user types "Feed the cat"
        │
        ▼
  app/(site)/my-todos/page.js ── fetch ──> app/todos/route.js
                                   │
                                   ├─ validation.js   checked? (length, type) ✅
                                   │
                                   ├─ database.js     glued into SQL? or "?" ✅
                                   │                  owner checked?          ✅
                                   ▼
  app/(site)/my-todos/page.js <── JSON ── answer
        │
        └─ shown as {text} by React (safe) or dangerouslySetInnerHTML (danger)? ✅
```

At every arrow, ask: *could a sneaky value cause trouble here?*

🧪 **Try the tricks safely** in the app's security lab:
**http://localhost:3000/course/security-review**.

## Practise on the bad examples

Each of these has a real security mistake. Try to find it **before** reading
the explanation:

| Exercise | Hint |
|----------|------|
| [SQL injection](../bad-examples/01-sql-injection.md) | Look for `+` near SQL |
| [XSS with innerHTML](../bad-examples/02-xss-innerhtml.md) | How is the text put on the page? |
| [Missing owner check](../bad-examples/03-missing-owner-check.md) | *Whose* todo is being deleted? |
| [Plain-text passwords](../bad-examples/04-plain-text-passwords.md) | What's stored in the database? |
| [Hard-coded API key](../bad-examples/05-hardcoded-api-key.md) | What would end up on GitHub? |

## Our security review checklist

- [ ] Every SQL query uses `?` placeholders → [`database.js`](../lib/db/database.js)
- [ ] Every todo query checks `user_id` → [`database.js`](../lib/db/database.js)
- [ ] User text is shown as plain text (no `dangerouslySetInnerHTML`) → [`TodoItem.js`](../components/TodoItem.js)
- [ ] Input is validated on the **backend** → [`lib/validation.js`](../lib/validation.js)
- [ ] Passwords are hashed → [`app/auth/signup/route.js`](../app/auth/signup/route.js)
- [ ] Changes need the CSRF token → [`lib/csrf.js`](../lib/csrf.js)
- [ ] No secrets in the code → [`.env.example`](../.env.example)
- [ ] Errors don't reveal details → [`lib/api.js`](../lib/api.js)

And the best part: we turned these into **tests**, so a robot re-checks them
on every change. See [`tests/security/`](../tests/security).

## New words

- **Security review**: reviewing code specifically for ways it could be misused.
- **Threat modelling**: imagining what an attacker might try.
- **Input**: anything that comes from outside the app (typing, URLs, cookies).
- **IDOR**: changing an id in a request to reach someone else's data.

## Questions

1. What's the "follow the input" trick?
   <details><summary>Answer</summary>
   Take anything a user can type and trace every place it goes, checking it's
   handled safely at each step.
   </details>

2. Why do we turn security checks into tests?
   <details><summary>Answer</summary>
   So they're checked automatically on every change, even if someone forgets.
   A test never gets tired!
   </details>

## 🛠️ Mini challenge

Be a (friendly) attacker against your own app:

1. Add a todo with the text `<b>bold?</b>`. Is it bold, or do you see the
   letters? Why?
2. Add a todo with the text `' OR '1'='1`. Did anything strange happen?
3. Log in as one user, add a todo, and note its id in the Network tab. Log in
   as a **different** user in a private window. In the Console, try:
   ```js
   fetch('/todos/1', { method: 'DELETE' }).then(r => console.log(r.status))
   ```
   What status do you get? (Hint: there are *two* defences stopping you.
   Which ones?)

---
[← Lesson 14](14-code-review.md) · Next: [Lesson 16 · Git and pull requests →](16-git-and-pull-requests.md)
