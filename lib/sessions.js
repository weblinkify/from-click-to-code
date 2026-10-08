// lib/sessions.js
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

import crypto from 'node:crypto';
import { serializeCookie, serializeExpiredCookie } from './cookies.js';

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
    sameSite: 'Lax',
    // Path=/: send it for every page on our site.
    path: '/',
  };
}

// Make a fresh session for this user and give the browser its wristband.
// `call` is the request we're answering (see lib/api.js).
function startSession(call, userId) {
  const { db, config } = call.context;
  // 32 random bytes = a number so long nobody could ever guess it.
  const sessionId = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + SESSION_LENGTH_MS;

  db.createSession(sessionId, userId, expiresAt);
  call.setCookie(
    serializeCookie(SESSION_COOKIE, sessionId, {
      ...sessionCookieOptions(config),
      maxAgeMs: SESSION_LENGTH_MS,
    })
  );
}

// Forget the browser's current session on the server (if it has one).
function forgetSession(call) {
  const sessionId = call.cookies[SESSION_COOKIE];
  if (sessionId) {
    call.context.db.deleteSession(sessionId);
  }
}

// Forget the session on the server AND tell the browser to drop the cookie.
function endSession(call) {
  forgetSession(call);
  call.setCookie(serializeExpiredCookie(SESSION_COOKIE, sessionCookieOptions(call.context.config)));
}

// If the browser shows a valid wristband, return the user. Otherwise null.
function findSessionUser(call) {
  const sessionId = call.cookies[SESSION_COOKIE];
  if (!sessionId) {
    return null;
  }
  return call.context.db.findUserBySession(sessionId, Date.now());
}

export { startSession, endSession, forgetSession, findSessionUser, SESSION_COOKIE };
