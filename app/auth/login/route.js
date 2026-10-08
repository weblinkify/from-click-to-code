// app/auth/login/route.js  ->  POST /auth/login
// Check the username and password, then hand out a wristband (session).
//
// rateLimit: true means only a few tries are allowed, then you must wait.

import bcrypt from 'bcrypt';
import { withApi, reply } from '../../../lib/api.js';
import { startSession, forgetSession } from '../../../lib/sessions.js';

// The same message for "no such user" and "wrong password", so nobody
// can use the login form to find out which usernames exist.
const WRONG_LOGIN = 'Wrong username or password.';

// Used when the username doesn't exist, so a wrong username takes as
// long to check as a wrong password. (Timing can leak secrets too!)
// It's made the first time someone logs in, then remembered.
let pretendHash = null;

async function getPretendHash(rounds) {
  if (!pretendHash) {
    pretendHash = await bcrypt.hash('not-a-real-password', rounds);
  }
  return pretendHash;
}

async function logIn(call) {
  const { db, config, metrics } = call.context;
  const username = typeof call.body.username === 'string' ? call.body.username.trim() : '';
  const password = typeof call.body.password === 'string' ? call.body.password : '';

  const user = db.findUserByUsername(username);
  const hashToCheck = user ? user.passwordHash : await getPretendHash(config.bcryptRounds);
  const passwordMatches = await bcrypt.compare(password, hashToCheck);

  if (!user || !passwordMatches) {
    // Lots of failed logins can mean someone is guessing. Count them.
    metrics.increment('loginsFailed');
    return reply(401, { error: WRONG_LOGIN });
  }

  // Throw away any old wristband first, then hand out a brand-new one.
  // (A fresh id on every login stops "session fixation" tricks.)
  forgetSession(call);
  startSession(call, user.id);
  return reply(200, { user: { id: user.id, username: user.username } });
}

export const POST = withApi(logIn, { rateLimit: true });
