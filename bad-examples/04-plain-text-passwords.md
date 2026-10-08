# 4 · Passwords stored as plain text

## The bad version ❌

```js
// DON'T DO THIS
function signUp(username, password) {
  db.prepare('INSERT INTO users (username, password) VALUES (?, ?)')
    .run(username, password);
}

function logIn(username, password) {
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  return user && user.password === password;
}
```

🔍 **Before reading on:** the SQL uses `?`, so it's safe from SQL injection.
What's still wrong?

## What could go wrong

The password is saved **exactly as typed**. If anyone ever sees the database
(a stolen backup, a curious helper, a bug that leaks it), they can read
every password straight away.

And people re-use passwords! A leaked `sunflower42` from our todo app might
also open someone's email or games account.

It's like keeping everyone's house keys on a hook by the front door,
with name tags on.

## The fix ✅

Store a **hash** made with a slow password-hashing tool like **bcrypt**.
A hash is like a smoothie: easy to make from fruit, impossible to turn back
into fruit. To check a login we blend the typed password again and compare
smoothies.

```js
const bcrypt = require('bcrypt');

async function signUp(username, password) {
  const passwordHash = await bcrypt.hash(password, 12);
  db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)')
    .run(username, passwordHash);
}

async function logIn(username, password) {
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user) {
    return false;
  }
  return bcrypt.compare(password, user.password_hash);
}
```

Bonus: bcrypt adds a random **salt**, so two people with the same password get
different hashes. And it's *slow on purpose*, so guessing millions of passwords
takes far too long.

👉 See the real code: [`backend/routes/auth.js`](../backend/routes/auth.js).
Test: [`tests/security/passwords.test.js`](../tests/security/passwords.test.js).

**Review rule:** a column called `password` (not `password_hash`) is a red flag.
