// middleware/cookies.js
// A "cookie" is a small note the server asks the browser to keep and
// show again on every visit, like a hand stamp at a swimming pool.
//
// The browser sends all its cookies in ONE line called the Cookie header:
//   "sid=abc123; csrf_token=xyz789"
// This helper splits that line into an easy object:
//   { sid: 'abc123', csrf_token: 'xyz789' }

function parseCookieHeader(header) {
  const cookies = {};
  if (!header) {
    return cookies;
  }

  for (const part of header.split(';')) {
    const equalsAt = part.indexOf('=');
    if (equalsAt === -1) {
      continue;
    }
    const name = part.slice(0, equalsAt).trim();
    const rawValue = part.slice(equalsAt + 1).trim();
    cookies[name] = safeDecode(rawValue);
  }
  return cookies;
}

// Cookie values may be "percent-encoded" (a space becomes %20).
// If the value is broken, keep it as it is instead of crashing.
function safeDecode(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function readCookies(req, res, next) {
  req.cookies = parseCookieHeader(req.headers.cookie);
  next();
}

module.exports = { readCookies, parseCookieHeader };
