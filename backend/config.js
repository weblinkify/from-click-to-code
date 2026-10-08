// config.js
// All the app's settings live here, in ONE place.
//
// The settings come from "environment variables": named values that are
// handed to the program when it starts (like writing instructions on a
// sticky note for whoever opens the shop today). Locally they come from
// the .env file; in the cloud they are set by the hosting service.
//
// SAFETY: secrets (like SESSION_SECRET) live ONLY in environment variables,
// never in the code, so they never end up on GitHub.

const crypto = require('node:crypto');

function readNumber(value, fallback) {
  const number = Number(value);
  if (value === undefined || value === '' || Number.isNaN(number)) {
    return fallback;
  }
  return number;
}

function readBoolean(value, fallback) {
  if (value === undefined || value === '') {
    return fallback;
  }
  return value === 'true';
}

function readConfig(env = process.env) {
  const isProduction = env.NODE_ENV === 'production';

  return {
    isProduction,

    // Which "door number" (port) the server listens on.
    port: readNumber(env.PORT, 3000),

    // Where the database file lives.
    dbPath: env.DB_PATH || 'data/todos.db',

    // The secret used to sign CSRF tokens. If none is given we invent a
    // random one, which works fine but changes every time the app restarts.
    sessionSecret: env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
    sessionSecretWasGenerated: !env.SESSION_SECRET,

    // Secure cookies are only sent over HTTPS (the padlock 🔒).
    // On by default in production, because real sites always use HTTPS.
    cookieSecure: readBoolean(env.COOKIE_SECURE, isProduction),

    // How much work bcrypt does to scramble a password. Higher = slower
    // for attackers to guess (and a little slower for us too).
    bcryptRounds: readNumber(env.BCRYPT_ROUNDS, 12),

    // Login rate limit: at most this many tries per window, per visitor.
    loginMaxAttempts: readNumber(env.LOGIN_MAX_ATTEMPTS, 5),
    loginWindowMs: readNumber(env.LOGIN_WINDOW_MINUTES, 15) * 60 * 1000,

    // Set to true when the app sits behind a "reverse proxy" (a front desk
    // server in the cloud), so we can see each visitor's real address.
    trustProxy: readBoolean(env.TRUST_PROXY, false),
  };
}

module.exports = { readConfig };
