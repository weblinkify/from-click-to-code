# 🚫 Bad examples: spot the mistake!

This folder is a **code review practice gym**. Each file shows a piece of code
with a mistake in it, the kind real programmers make every day, on purpose,
so you can practise finding it.

> ⚠️ **Nothing in this folder is part of the real app.**
> The code lives inside Markdown files, so it can't be run or imported by
> accident. The real, safe versions are in [`../backend`](../backend) and
> [`../frontend`](../frontend).

## How to use these

1. Open a file and read **only the "Bad version"** section.
2. Pretend you're reviewing a friend's homework. What could go wrong?
3. Write down your answer.
4. Then read on: what an attacker could do, and how to fix it.

| # | File | The mistake | Lesson |
|---|------|-------------|--------|
| 1 | [01-sql-injection.md](01-sql-injection.md) | SQL glued together with `+` | [15 · Security review](../lessons/15-security-review.md) |
| 2 | [02-xss-innerhtml.md](02-xss-innerhtml.md) | Todo text put on the page with `innerHTML` | [15 · Security review](../lessons/15-security-review.md) |
| 3 | [03-missing-owner-check.md](03-missing-owner-check.md) | Anyone can delete anyone's todo | [15 · Security review](../lessons/15-security-review.md) |
| 4 | [04-plain-text-passwords.md](04-plain-text-passwords.md) | Passwords saved as they are | [07 · Login](../lessons/07-login.md) |
| 5 | [05-hardcoded-api-key.md](05-hardcoded-api-key.md) | A secret key written in the code | [08 · Security](../lessons/08-security.md) |
| 6 | [06-messy-function.md](06-messy-function.md) | Bad names and no error handling | [14 · Code review](../lessons/14-code-review.md) |

## A reviewer's checklist

When you review any code, ask:

- [ ] Does user input ever get **glued into** SQL or HTML?
- [ ] Does every todo query check **who owns it**?
- [ ] Are passwords **hashed**?
- [ ] Are there any **secrets** written in the code?
- [ ] Would I understand the **names** if I came back in a month?
- [ ] What happens when something **goes wrong**?
