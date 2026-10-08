// middleware/sessions.js
// A "session" is how the server remembers that you are logged in.
//
// It works like a wristband at a theme park:
//   1. You log in (show your ticket once at the gate).
//   2. The server gives your browser a wristband: a cookie called "sid"
//      holding a long random number that nobody could guess.
//   3. On every later visit the browser shows the wristband, and we look
//      up the number in the sessions table to see who you are.
//
//   browser                         server
//   -------                         ------
//   POST /auth/login  ---------->   password OK? make session "f3a9..."
//                     <----------   Set-Cookie: sid=f3a9...
//   GET /todos + sid  ---------->   look up "f3a9..." -> it's Sam!

const crypto = require('node:crypto');

const SESSION_COOKIE = 'sid';
const SESSION_LENGTH_MS = 7 * 24 * 60 * 60 * 1000; // one week

// The safety settings for our wristband cookie. Each one matters:
function sessionCookieOptions(config) {
  return {
    // HttpOnly: JavaScript in the page can't read it, so a sneaky
    // script can't steal your wristband.
    httpOnly: true,
    // Secure: only sent over HTTPS (encrypted), never plain HTTP.
    secure: config.cookieSecure,
    // SameSite=Lax: other websites can't make your browser send it
    // along with their sneaky form submissions.
    sameSite: 'lax',
    // Path=/: send it for every page on our site.
    path: '/',
    maxAge: SESSION_LENGTH_MS,
  };
}

// Make a fresh session for this user and give the browser its wristband.
function startSession(db, config, res, userId) {
  // 32 random bytes = a number so long nobody could ever guess it.
  const sessionId = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + SESSION_LENGTH_MS;

  db.createSession(sessionId, userId, expiresAt);
  res.cookie(SESSION_COOKIE, sessionId, sessionCookieOptions(config));
}

// Forget the browser's current session on the server (if it has one).
function forgetSession(db, req) {
  const sessionId = req.cookies[SESSION_COOKIE];
  if (sessionId) {
    db.deleteSession(sessionId);
  }
}

// Forget the session on the server AND tell the browser to drop the cookie.
function endSession(db, config, req, res) {
  forgetSession(db, req);
  res.clearCookie(SESSION_COOKIE, sessionCookieOptions(config));
}

// Runs on every request: if the browser shows a valid wristband,
// put the user on req.user so the routes know who is asking.
function loadSession(db) {
  return function loadSessionMiddleware(req, res, next) {
    req.user = null;

    const sessionId = req.cookies[SESSION_COOKIE];
    if (sessionId) {
      req.user = db.findUserBySession(sessionId, Date.now());
    }
    next();
  };
}

module.exports = { startSession, endSession, forgetSession, loadSession, SESSION_COOKIE };
