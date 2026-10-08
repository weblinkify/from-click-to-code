// lib/rate-limit.js
// "Rate limiting" means: you only get a few tries, then you must wait.
//
// Without it, a robot could guess thousands of passwords a minute.
// With it, after a few wrong guesses the door stays shut for a while.
// It's like a phone that locks after too many wrong PINs.
//
// We remember tries per "key" (a username, or a visitor's address) in a
// simple Map. See rateLimitKeys in lib/api.js for which keys we use.
// (A Map lives in memory, so it resets when the server restarts. A big
// app with many servers would keep this in a shared store instead.)

function createRateLimiter({ maxAttempts, windowMs }) {
  // key -> { count, resetAt }
  const attempts = new Map();

  function forgetOldEntries(now) {
    for (const [key, entry] of attempts) {
      if (entry.resetAt <= now) {
        attempts.delete(key);
      }
    }
  }

  // Counts one try for this key.
  // Returns { allowed: true } or { allowed: false, secondsToWait }.
  function recordAttempt(key) {
    const now = Date.now();

    // Tidy up now and then so the Map doesn't grow forever.
    if (attempts.size > 1000) {
      forgetOldEntries(now);
    }

    let entry = attempts.get(key);
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      attempts.set(key, entry);
    }

    entry.count = entry.count + 1;

    if (entry.count > maxAttempts) {
      return { allowed: false, secondsToWait: Math.ceil((entry.resetAt - now) / 1000) };
    }
    return { allowed: true };
  }

  return { recordAttempt };
}

export { createRateLimiter };
