# Lesson 6 · HTTP and HTTPS: postcards and sealed envelopes ✉️

**HTTP** (*HyperText Transfer Protocol*) is the language browsers and servers
use to talk. A **protocol** is just a set of agreed rules, like how in a letter
you write the address on the front and sign your name at the end.

**HTTPS** is the same language with an **S for Secure**: everything is
**encrypted** (scrambled) so nobody in the middle can read it.

## Postcard vs sealed envelope

```
  HTTP  = a postcard 📮                    HTTPS = a sealed, locked envelope 🔒

  ┌──────────────────────────┐            ┌──────────────────────────┐
  │ username: sam            │            │ x9$kQ!2#vB...zP@7&mL     │
  │ password: sunflower42    │            │ (scrambled nonsense)     │
  └──────────────────────────┘            └──────────────────────────┘
  Anyone who handles it                    Only the real server has
  along the way can read it.               the key to unscramble it.

   You ──> café Wi-Fi ──> internet ──> server
            👀 a snoop here can read a postcard,
               but NOT a sealed envelope
```

HTTPS also proves **who you're talking to**. The server shows a
**certificate**, like an ID card signed by a trusted organisation, so you know
you've reached the *real* site and not a pretend one. That's what the 🔒
padlock in the address bar means.

## Where this shows up in our project

On your own computer we use plain `http://localhost`. That's OK, because the
messages never leave your computer. On a real server we'd always use HTTPS.
The app is ready for that:

- **Secure cookies.** In [`backend/middleware/sessions.js`](../backend/middleware/sessions.js),
  the login cookie gets `secure: config.cookieSecure`. A **Secure** cookie is
  only ever sent inside the sealed envelope (HTTPS). It's switched on in
  production by [`backend/config.js`](../backend/config.js).
- **"Always use HTTPS" header.** In [`backend/app.js`](../backend/app.js),
  `strictTransportSecurity` tells browsers *"from now on, only visit me over
  HTTPS"*. We only turn it on when we really have HTTPS.
- **Why docker-compose turns Secure off.** Read the comment in
  [`docker-compose.yml`](../docker-compose.yml): on `http://localhost`, some
  browsers would throw Secure cookies away and you couldn't log in!
- **In the cloud**, HTTPS is usually handled by a **load balancer** (a front
  desk server) before requests reach our app. See the deploy notes at the
  bottom of [`.github/workflows/ci.yml`](../.github/workflows/ci.yml).

## New words

- **HTTP**: the rules browsers and servers use to talk.
- **Protocol**: a set of agreed rules for communicating.
- **HTTPS**: HTTP inside an encrypted, sealed envelope.
- **Encryption**: scrambling a message so only someone with the key can read it.
- **Certificate**: a website's ID card, proving it's the real site.

## Questions

1. Why is typing a password on an `http://` site (not `https://`) risky on café Wi-Fi?
   <details><summary>Answer</summary>
   It travels like a postcard. Someone else on the same Wi-Fi could read your
   password on its way to the server.
   </details>

2. What does a Secure cookie do?
   <details><summary>Answer</summary>
   The browser only sends it over HTTPS, so it can never travel "on a postcard".
   </details>

## 🛠️ Mini challenge

1. Visit any big website (like `https://www.wikipedia.org`) and click the
   padlock 🔒 next to the address. Find who issued its certificate.
2. Now open http://localhost:3000. Your browser shows no padlock, maybe a
   "Not secure" note. That's expected on your own computer!
3. Log in, open DevTools → **Application** (Chrome) or **Storage** (Firefox)
   → **Cookies** → `http://localhost:3000`. Find the `sid` cookie. Is the
   **Secure** box ticked? Why not? (Hint: read the comment in
   [`docker-compose.yml`](../docker-compose.yml).)

---
[← Lesson 5](05-url-parts.md) · Next: [Lesson 7 · Logging in →](07-login.md)
