// routes/auth.js
// "Auth" is short for authentication: proving who you are.
//
//   GET  /auth/csrf    -> get a security-handshake token (see csrf.js)
//   GET  /auth/me      -> "who am I logged in as?"
//   POST /auth/signup  -> make a new account (and log in)
//   POST /auth/login   -> log in with username + password
//   POST /auth/logout  -> log out
//
// PASSWORD SAFETY: we never save the password itself. bcrypt turns it
// into a "hash", like putting fruit through a blender. You can always
// blend the same fruit again and compare smoothies, but you can never
// un-blend a smoothie back into fruit.
//
//   "sunflower42"  --bcrypt-->  "$2b$12$Vq0...Zk9e"   (this is what we store)

const express = require('express');
const bcrypt = require('bcrypt');
const { validateUsername, validatePassword } = require('../validation');
const { startSession, endSession, forgetSession } = require('../middleware/sessions');
const { sendCsrfToken } = require('../middleware/csrf');
const { createRateLimiter } = require('../middleware/rate-limit');

// The same message for "no such user" and "wrong password", so nobody
// can use the login form to find out which usernames exist.
const WRONG_LOGIN = 'Wrong username or password.';

function publicUser(user) {
  return { id: user.id, username: user.username };
}

function createAuthRouter(db, config) {
  const router = express.Router();

  // Used when the username doesn't exist, so a wrong username takes as
  // long to check as a wrong password. (Timing can leak secrets too!)
  const pretendHash = bcrypt.hashSync('not-a-real-password', config.bcryptRounds);

  const loginRateLimit = createRateLimiter({
    maxAttempts: config.loginMaxAttempts,
    windowMs: config.loginWindowMs,
  });

  router.get('/csrf', sendCsrfToken(config));

  router.get('/me', (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not logged in.' });
    }
    res.status(200).json({ user: publicUser(req.user) });
  });

  router.post('/signup', async (req, res) => {
    const body = req.body || {};
    const username = validateUsername(body.username);
    if (!username.ok) {
      return res.status(400).json({ error: username.error });
    }
    const password = validatePassword(body.password);
    if (!password.ok) {
      return res.status(400).json({ error: password.error });
    }

    const passwordHash = await bcrypt.hash(password.value, config.bcryptRounds);
    const user = db.createUser(username.value, passwordHash);
    if (!user) {
      // 409 means "Conflict": this clashes with something that already exists.
      return res.status(409).json({ error: 'That username is already taken.' });
    }

    startSession(db, config, res, user.id);
    res.status(201).json({ user: publicUser(user) });
  });

  router.post('/login', loginRateLimit, async (req, res) => {
    const body = req.body || {};
    const username = typeof body.username === 'string' ? body.username.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    const user = db.findUserByUsername(username);
    const hashToCheck = user ? user.passwordHash : pretendHash;
    const passwordMatches = await bcrypt.compare(password, hashToCheck);

    if (!user || !passwordMatches) {
      return res.status(401).json({ error: WRONG_LOGIN });
    }

    // Throw away any old wristband first, then hand out a brand-new one.
    // (A fresh id on every login stops "session fixation" tricks.)
    forgetSession(db, req);
    startSession(db, config, res, user.id);
    res.status(200).json({ user: publicUser(user) });
  });

  router.post('/logout', (req, res) => {
    endSession(db, config, req, res);
    res.status(200).json({ loggedOut: true });
  });

  return router;
}

module.exports = { createAuthRouter };
