// lib/api.js
// Every API route (like /todos or /auth/login) is wrapped in withApi().
// It's the list of stops every request passes through, like a letter
// going through the sorting machines at the post office:
//
//   request
//     |
//     v
//   1. give it a request ID          (a name tag, to find it in the logs)
//   2. read the cookies              (the browser's notes)
//   3. find out WHO is asking        (the session "wristband")
//   4. CSRF check                    (the secret handshake, for changes)
//   5. login check                   (some routes are members-only)
//   6. read the JSON body            (what the browser sent us)
//   7. rate limit                    (only for login: a few tries, then wait)
//   8. the route itself              (e.g. "add a todo")
//     |
//     v
//   answer + X-Request-Id + cookies, then one log line and the counters
//
// If ANYTHING crashes along the way, the user gets a calm, generic
// message, and the scary details go into the logs where only we look.

import crypto from 'node:crypto';
import { getContext } from './context.js';
import { parseCookieHeader } from './cookies.js';
import { findSessionUser } from './sessions.js';
import { passesCsrfCheck } from './csrf.js';

const MAX_BODY_BYTES = 10 * 1024; // 10 kilobytes is plenty for a todo
const GENERIC_ERROR = 'Something went wrong on our side. Please try again.';

// Routes answer with reply(status, body). For example:
//   return reply(201, { todo });
function reply(status, body, headers = {}) {
  return { status, body, headers };
}

// A problem with the request that we spotted on purpose (like broken JSON).
class BadRequestError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Read the JSON the browser sent. An empty body counts as {}.
async function readJsonBody(request) {
  const text = await request.text();
  if (Buffer.byteLength(text) > MAX_BODY_BYTES) {
    throw new BadRequestError(413, 'That request was too big.');
  }
  if (text.trim() === '') {
    return {};
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new BadRequestError(400, 'That request was not valid JSON.');
  }
}

// What do we count login tries against? (See lib/rate-limit.js.)
//
// 1. The USERNAME being tried. A robot guessing Sam's password is
//    stopped after a few tries, no matter where it hides.
// 2. The visitor's ADDRESS, but only behind a trusted cloud "front desk"
//    (TRUST_PROXY=true). Without one, the X-Forwarded-For header is
//    written by the visitor themselves, so a sneaky visitor could make up
//    a new address for every try. We never trust it in that case.
//
// The trade-off: someone could lock Sam out for a few minutes by typing
// wrong passwords on purpose. Real teams weigh trade-offs like this!
function rateLimitKeys(call) {
  const username = typeof call.body.username === 'string' ? call.body.username.trim().toLowerCase() : '';
  const keys = [`username:${username}`];

  if (call.context.config.trustProxy) {
    const header = call.request.headers.get('x-forwarded-for') || '';
    const firstAddress = header.split(',')[0].trim();
    if (firstAddress) {
      keys.push(`address:${firstAddress}`);
    }
  }
  return keys;
}

// Count one try against every key. Blocked if ANY key has had too many.
function checkRateLimit(call) {
  let secondsToWait = 0;
  for (const key of rateLimitKeys(call)) {
    const attempt = call.context.loginRateLimiter.recordAttempt(key);
    if (!attempt.allowed) {
      secondsToWait = Math.max(secondsToWait, attempt.secondsToWait);
    }
  }
  return secondsToWait;
}

// Stops 3 to 8. Returns a reply.
async function runStops(call, handler, options) {
  // /health and /metrics don't care who you are, so they skip this stop.
  // (That way a broken database can't stop the health check from answering.)
  if (!options.skipSession) {
    call.user = findSessionUser(call);
  }

  if (!passesCsrfCheck(call)) {
    // 403 means "we know what you asked, but you're not allowed".
    return reply(403, { error: 'Security check failed. Please reload the page and try again.' });
  }

  if (options.requireLogin && !call.user) {
    // 401 means "we don't know who you are, please log in first".
    return reply(401, { error: 'Please log in first.' });
  }

  if (!['GET', 'HEAD'].includes(call.request.method)) {
    call.body = await readJsonBody(call.request);
  }

  if (options.rateLimit) {
    const secondsToWait = checkRateLimit(call);
    if (secondsToWait > 0) {
      // 429 means "Too Many Requests: slow down!"
      // Retry-After tells the browser how many seconds to wait.
      return reply(
        429,
        { error: 'Too many tries. Please wait a few minutes and try again.' },
        { 'Retry-After': String(secondsToWait) }
      );
    }
  }

  return handler(call);
}

// Turn our reply into a real web Response, with the extra headers.
function toResponse(call, answer) {
  const headers = new Headers(answer.headers);
  headers.set('Content-Type', 'application/json');
  headers.set('X-Request-Id', call.requestId);
  for (const cookie of call.newCookies) {
    headers.append('Set-Cookie', cookie);
  }
  return new Response(JSON.stringify(answer.body), { status: answer.status, headers });
}

// options: { requireLogin, rateLimit, skipSession } (each true or false)
function withApi(handler, options = {}) {
  return async function apiRoute(request, routeContext) {
    const startTime = Date.now();
    const context = getContext();

    // "call" holds everything about this one request.
    const call = {
      request,
      context,
      requestId: crypto.randomUUID(),
      path: new URL(request.url).pathname,
      cookies: parseCookieHeader(request.headers.get('cookie')),
      params: routeContext && routeContext.params ? await routeContext.params : {},
      user: null,
      body: {},
      newCookies: [],
      setCookie(line) {
        this.newCookies.push(line);
      },
    };

    let answer;
    try {
      answer = await runStops(call, handler, options);
    } catch (error) {
      if (error instanceof BadRequestError) {
        answer = reply(error.status, { error: error.message });
      } else {
        // OUR mistake. Write ALL the details in the logs...
        context.logger.error('request failed', {
          requestId: call.requestId,
          method: request.method,
          path: call.path,
          error: error.message,
          stack: error.stack,
        });
        // ...but tell the user only a short, friendly message, plus the
        // request ID so they can tell us which visit went wrong.
        answer = reply(500, { error: GENERIC_ERROR, requestId: call.requestId });
      }
    }

    context.metrics.increment('requestsTotal');
    if (answer.status >= 500) {
      context.metrics.increment('errorsTotal');
    }
    context.logger.info('request finished', {
      requestId: call.requestId,
      method: request.method,
      path: call.path,
      status: answer.status,
      ms: Date.now() - startTime,
    });

    return toResponse(call, answer);
  };
}

export { withApi, reply };
