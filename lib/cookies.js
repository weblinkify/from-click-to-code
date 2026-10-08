// lib/cookies.js
// A "cookie" is a small note the server asks the browser to keep and
// show again on every visit, like a hand stamp at a swimming pool.
//
// READING: the browser sends all its cookies in ONE line, the Cookie header:
//   "sid=abc123; csrf_token=xyz789"
// parseCookieHeader splits it into an easy object:
//   { sid: 'abc123', csrf_token: 'xyz789' }
//
// WRITING: to give the browser a cookie, the server sends a Set-Cookie header:
//   "sid=abc123; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800"
// serializeCookie builds that line for us.

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

// options: { httpOnly, secure, sameSite, path, maxAgeMs }
function serializeCookie(name, value, options) {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  parts.push(`Path=${options.path || '/'}`);
  if (options.maxAgeMs !== undefined) {
    parts.push(`Max-Age=${Math.floor(options.maxAgeMs / 1000)}`);
  }
  if (options.httpOnly) {
    parts.push('HttpOnly');
  }
  if (options.secure) {
    parts.push('Secure');
  }
  if (options.sameSite) {
    parts.push(`SameSite=${options.sameSite}`);
  }
  return parts.join('; ');
}

// To delete a cookie, we send it again, empty, and already expired.
function serializeExpiredCookie(name, options) {
  return serializeCookie(name, '', { ...options, maxAgeMs: 0 }) +
    '; Expires=Thu, 01 Jan 1970 00:00:00 GMT';
}

export { parseCookieHeader, serializeCookie, serializeExpiredCookie };
