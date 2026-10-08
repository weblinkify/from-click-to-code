# Lesson 7 · Logging in: passwords, hashes and wristbands 🎟️

Our app needs to know **who you are**, so it can show *your* todos and nobody
else's. Proving who you are is called **authentication** (often shortened to
**auth**).

It works like a **theme park**:

1. At the gate you show your **ticket** once (your password).
2. They give you a **wristband** (a session cookie).
3. For the rest of the day, rides just check your wristband.

```
   Browser                                          Server
   ───────                                          ──────
   POST /auth/login
   {username: "sam", password: "sunflower42"} ──>   find "sam" in users table
                                                    bcrypt: does the password
                                                    match the stored hash? ✅
                                                    make session "f3a9c1..."
                       <── 200 OK + Set-Cookie: sid=f3a9c1...; HttpOnly

   GET /todos  (browser adds Cookie: sid=f3a9c1...) ──> look up "f3a9c1..."
                                                       in sessions table → it's sam!
                       <── 200 OK + sam's todos
```

## Part 1: Never keep the real password

If we saved passwords exactly as typed and someone stole our database, they'd
have everyone's password, and people often use the same password everywhere!

So we save a **hash** instead. A hash is like a **smoothie** 🍓🍌:

- Blending fruit into a smoothie is easy.
- Turning a smoothie back into whole fruit is impossible.
- Blend the same fruit again and you get the same smoothie, so you can compare.

```
  "sunflower42"  ──bcrypt──>  "$2b$12$Vq0e8...kZ9e"   ← this is what we store
```

We use **bcrypt**, which is slow *on purpose* (so guessing millions of
passwords takes forever) and adds a random **salt** (so two people with the
same password get different hashes).

👉 See `bcrypt.hash` in [`app/auth/signup/route.js`](../app/auth/signup/route.js),
`bcrypt.compare` in [`app/auth/login/route.js`](../app/auth/login/route.js),
and the `password_hash` column in [`lib/db/schema.sql`](../lib/db/schema.sql).

## Part 2: The wristband (session)

After a good login we make a **session**: a very long random number that's
impossible to guess. It goes in the `sessions` table *and* in a **cookie**, a
small note the browser keeps and sends back on every visit.

👉 See [`lib/sessions.js`](../lib/sessions.js).
The cookie has three safety settings:

| Setting | What it does |
|---------|--------------|
| `HttpOnly` | JavaScript on the page can't read it, so sneaky scripts can't steal it |
| `Secure` | Only sent over HTTPS (in production) |
| `SameSite=Lax` | Other websites can't make your browser send it with their sneaky forms |

## Part 3: Little details that matter

- **Same message for everything.** Wrong username *and* wrong password both
  say *"Wrong username or password."* Otherwise a sneaky person could find
  out which usernames exist.
- **Fresh wristband every login.** Old sessions are thrown away
  (`forgetSession`).
- **Logging out** deletes the session on the server *and* the cookie in the
  browser (`endSession`).

## New words

- **Authentication (auth)**: proving who you are.
- **Hash**: a scrambled fingerprint of data that can't be turned back.
- **Salt**: random extra bits mixed in so identical passwords get different hashes.
- **Session**: the server remembering you're logged in.
- **Cookie**: a small note the browser keeps for a website and sends back each visit.

## Questions

1. Why don't we store the real password?
   <details><summary>Answer</summary>
   If the database is ever stolen or seen, the real passwords would be
   exposed. A hash can't be turned back into the password.
   </details>

2. Why does the login say "Wrong username or password" instead of "That user doesn't exist"?
   <details><summary>Answer</summary>
   So nobody can use the login form to find out which usernames exist.
   </details>

3. What does `HttpOnly` protect against?
   <details><summary>Answer</summary>
   A sneaky script running in the page can't read the cookie, so it can't
   steal your "wristband".
   </details>

## 🛠️ Mini challenge

1. Sign up with a new account. In DevTools → **Network**, click the `signup`
   request and look at **Response Headers**. Find `Set-Cookie: sid=...`.
2. Go to DevTools → **Application** → **Cookies**. Find `sid`. Is `HttpOnly`
   ticked?
3. Open the **Console** tab and type `document.cookie` then Enter. You'll see
   `csrf_token` but **not** `sid`. That's HttpOnly doing its job! 🛡️

---
[← Lesson 6](06-http-vs-https.md) · Next: [Lesson 8 · Security →](08-security.md)
