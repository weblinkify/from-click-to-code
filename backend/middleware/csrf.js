// middleware/csrf.js
// CSRF stands for "Cross-Site Request Forgery". Big words, simple idea:
//
//   A sneaky website could contain a hidden form that sends a request
//   to OUR site. Your browser would helpfully attach your cookies, so
//   it would look like YOU asked to delete your todos!
//
// The fix is a "secret handshake". Before changing anything, the page must
// show a token that only pages from OUR site can read:
//
//   1. Our page calls GET /auth/csrf. We put a token in a cookie
//      AND in the answer.
//   2. On every POST / PUT / DELETE, our page copies the token into an
//      "X-CSRF-Token" header.
//   3. We check that the header and the cookie match, and that the token
//      carries our signature.
//
// A sneaky site can make your browser SEND our cookies, but it can't READ
// them, so it can never copy the token into the header. Handshake fails, 403!
//
// The signature is an "HMAC": a stamp made with our SESSION_SECRET.
// Without the secret nobody can make a token we'd accept.

const crypto = require('node:crypto');

const CSRF_COOKIE = 'csrf_token';
const CSRF_HEADER = 'x-csrf-token';

// These methods only READ things, so they don't need the handshake.
const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

function sign(value, secret) {
  return crypto.createHmac('sha256', secret).update(value).digest('hex');
}

// A token looks like "<random part>.<signature of the random part>"
function makeCsrfToken(secret) {
  const random = crypto.randomBytes(16).toString('hex');
  return `${random}.${sign(random, secret)}`;
}

// Compare two strings without leaking hints through timing.
function sameText(a, b) {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  if (bufferA.length !== bufferB.length) {
    return false;
  }
  return crypto.timingSafeEqual(bufferA, bufferB);
}

function isSignedByUs(token, secret) {
  const [random, signature] = token.split('.');
  if (!random || !signature) {
    return false;
  }
  return sameText(signature, sign(random, secret));
}

// GET /auth/csrf: hand out a fresh token.
function sendCsrfToken(config) {
  return function sendCsrfTokenHandler(req, res) {
    const token = makeCsrfToken(config.sessionSecret);
    res.cookie(CSRF_COOKIE, token, {
      // NOT httpOnly: our own page needs to be able to read it.
      httpOnly: false,
      secure: config.cookieSecure,
      sameSite: 'lax',
      path: '/',
    });
    res.status(200).json({ csrfToken: token });
  };
}

// Runs on every request and blocks changes without a correct handshake.
function csrfProtection(config) {
  return function csrfProtectionMiddleware(req, res, next) {
    if (SAFE_METHODS.includes(req.method)) {
      return next();
    }

    const fromHeader = req.get(CSRF_HEADER) || '';
    const fromCookie = req.cookies[CSRF_COOKIE] || '';

    const handshakeOk =
      fromHeader !== '' &&
      sameText(fromHeader, fromCookie) &&
      isSignedByUs(fromHeader, config.sessionSecret);

    if (!handshakeOk) {
      // 403 means "we know what you asked, but you're not allowed".
      return res
        .status(403)
        .json({ error: 'Security check failed. Please reload the page and try again.' });
    }
    next();
  };
}

module.exports = { csrfProtection, sendCsrfToken, makeCsrfToken, CSRF_COOKIE };
