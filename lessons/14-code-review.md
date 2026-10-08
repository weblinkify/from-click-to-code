# Lesson 14 · Code review: a friend checks your homework 👀

Before new code joins the real app, **another person reads it**. This is a
**code review**. It's not about catching people out. It's teamwork: two pairs
of eyes spot more than one.

It's like asking a friend to read your story before you hand it in. They
might spot a typo, a confusing sentence, or a plot hole you couldn't see
because *you* knew what you meant.

```
   You write code ──> open a pull request ──> reviewer reads it
                                                  │
                         ┌────────────────────────┴───────────────┐
                         ▼                                        ▼
                "Looks good! ✅"                   "Could you rename this? 💬"
                     merge it                       you fix it, they look again
```

## What reviewers look for

1. **Does it work?** Does it do what the user story asked?
2. **Is it safe?** (Next lesson is all about this!)
3. **Is it clear?** Good names, small functions, helpful comments.
4. **Is it tested?** Is there a test that would catch it breaking?
5. **What happens when things go wrong?** Errors, empty input, the server down.

## How to give kind feedback

Reviews are about the **code**, never the **person**.

| 😬 Unkind | 😊 Kind and helpful |
|-----------|---------------------|
| "This is wrong." | "I think this might let an empty todo through. What do you think?" |
| "Bad name." | "Could we call this `validateTodoText`? I wasn't sure what `check` did." |
| "Why would you do this?!" | "I learned something here! Could you add a comment explaining why?" |

And always mention something **good**, too!

## Practice: the bad examples

We made a **practice gym** of code with mistakes in it: the
[`bad-examples/`](../bad-examples/README.md) folder. Start with the
[messy function](../bad-examples/06-messy-function.md): it has no security
holes, but it's very hard to work with. How many problems can you list?

## New words

- **Code review**: someone else reading your code before it's merged.
- **Reviewer**: the person doing the reading.
- **Feedback**: comments and suggestions.
- **Approve**: the reviewer says "this is ready".

## Questions

1. Is code review about finding who made a mistake?
   <details><summary>Answer</summary>
   No! It's about making the code better together. Everyone's code gets
   reviewed, even experts'.
   </details>

2. Rewrite kindly: *"This function is a mess."*
   <details><summary>Answer</summary>
   Something like: "I found this function a bit hard to follow. Could we
   split it into smaller pieces with clearer names?"
   </details>

## 🛠️ Mini challenge

Open [`bad-examples/06-messy-function.md`](../bad-examples/06-messy-function.md).
Read **only the bad version**. Write down every problem you can find, and
write each one as a *kind* review comment. Then read the rest of the file.
How many did you spot? Did you find any it missed?

---
[← Lesson 13](13-testing.md) · Next: [Lesson 15 · Security review →](15-security-review.md)
