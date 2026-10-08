// tests/helpers/test-app.js
// Builds a brand-new app context with an EMPTY in-memory database for each
// test, so one test can never mess up another (like a fresh sheet of paper).
//
// There's no real server here. Instead, a "pretend browser" hands web
// Requests straight to our route handlers (the files in app/**/route.js),
// just like Next.js does, and keeps cookies between requests.

import assert from 'node:assert/strict';
import { buildContext, setContext } from '../../lib/context.js';
import { readConfig } from '../../lib/config.js';
import { createLogger } from '../../lib/logger.js';

import * as todosRoute from '../../app/todos/route.js';
import * as oneTodoRoute from '../../app/todos/[id]/route.js';
import * as signupRoute from '../../app/auth/signup/route.js';
import * as loginRoute from '../../app/auth/login/route.js';
import * as logoutRoute from '../../app/auth/logout/route.js';
import * as meRoute from '../../app/auth/me/route.js';
import * as csrfRoute from '../../app/auth/csrf/route.js';
import * as healthRoute from '../../app/health/route.js';
import * as metricsRoute from '../../app/metrics/route.js';

const TEST_PASSWORD = 'correct-horse-battery';
const TEST_VISITOR_ADDRESS = '127.0.0.1';

// Which route file answers which address. [id] becomes a named group.
const ROUTES = [
  { pattern: /^\/todos$/, module: todosRoute },
  { pattern: /^\/todos\/(?<id>[^/]+)$/, module: oneTodoRoute },
  { pattern: /^\/auth\/signup$/, module: signupRoute },
  { pattern: /^\/auth\/login$/, module: loginRoute },
  { pattern: /^\/auth\/logout$/, module: logoutRoute },
  { pattern: /^\/auth\/me$/, module: meRoute },
  { pattern: /^\/auth\/csrf$/, module: csrfRoute },
  { pattern: /^\/health$/, module: healthRoute },
  { pattern: /^\/metrics$/, module: metricsRoute },
];

// Settings for tests: a fixed secret, and fast (but still real) bcrypt.
function testConfig(overrides = {}) {
  return {
    ...readConfig({}),
    dbPath: ':memory:',
    sessionSecret: 'test-secret',
    bcryptRounds: 4,
    ...overrides,
  };
}

// Send one request to the right route handler, like Next.js would.
// options: { body, rawBody, headers }
async function sendRequest(method, path, options = {}) {
  const url = new URL(path, 'http://localhost:3000');
  const route = ROUTES.find((candidate) => candidate.pattern.test(url.pathname));
  if (!route) {
    throw new Error(`No route file answers ${url.pathname}`);
  }
  const handler = route.module[method];
  if (!handler) {
    throw new Error(`${url.pathname} has no ${method} handler`);
  }

  const headers = new Headers(options.headers);
  headers.set('x-forwarded-for', TEST_VISITOR_ADDRESS);
  let body;
  if (options.rawBody !== undefined) {
    body = options.rawBody;
  } else if (options.body !== undefined) {
    headers.set('content-type', 'application/json');
    body = JSON.stringify(options.body);
  }

  const request = new Request(url, { method, headers, body });
  const params = url.pathname.match(route.pattern).groups || {};
  const response = await handler(request, { params: Promise.resolve(params) });

  const text = await response.text();
  return {
    status: response.status,
    text,
    body: text ? JSON.parse(text) : {},
    headers: Object.fromEntries(response.headers),
    cookies: response.headers.getSetCookie(),
  };
}

// Log lines are caught in the "logs" list instead of filling the screen,
// so tests can read them.
function makeTestApp(configOverrides) {
  const logs = [];
  const config = testConfig(configOverrides);
  const logger = createLogger({ write: (line) => logs.push(JSON.parse(line)) });
  const context = buildContext({ config, logger });
  setContext(context);

  // "api" sends requests with no cookies at all, unless you give some.
  const api = {
    get: (path, headers) => sendRequest('GET', path, { headers }),
    post: (path, body, headers) => sendRequest('POST', path, { body, headers }),
  };
  return { db: context.db, config, logs, metrics: context.metrics, api };
}

// A pretend browser: it keeps cookies between requests (like a real one)
// and does the CSRF handshake automatically on POST, PUT and DELETE.
async function makeBrowser() {
  const jar = {};

  function cookieHeader() {
    return Object.entries(jar)
      .map(([name, value]) => `${name}=${value}`)
      .join('; ');
  }

  function remember(cookies) {
    for (const line of cookies) {
      const [pair, ...settings] = line.split(';');
      const [name, value] = pair.split('=');
      const expired = settings.some((setting) => setting.trim() === 'Max-Age=0');
      if (expired) {
        delete jar[name];
      } else {
        jar[name] = value;
      }
    }
  }

  async function send(method, path, options = {}) {
    const headers = { cookie: cookieHeader(), ...options.headers };
    if (method !== 'GET' && options.withCsrf !== false) {
      headers['x-csrf-token'] = browser.csrfToken;
    }
    const res = await sendRequest(method, path, { ...options, headers });
    remember(res.cookies);
    return res;
  }

  const browser = {
    csrfToken: null,
    jar,
    get: (path) => send('GET', path),
    post: (path, body) => send('POST', path, { body }),
    put: (path, body) => send('PUT', path, { body }),
    delete: (path) => send('DELETE', path),
    // For tests that need to break the rules on purpose.
    send,
  };

  const res = await browser.get('/auth/csrf');
  browser.csrfToken = res.body.csrfToken;
  return browser;
}

// A pretend browser that has already signed up and is logged in.
async function signUp(username) {
  const browser = await makeBrowser();
  const res = await browser.post('/auth/signup', { username, password: TEST_PASSWORD });
  assert.equal(res.status, 201, `sign up as ${username} should work`);
  return browser;
}

export { makeTestApp, makeBrowser, signUp, sendRequest, TEST_PASSWORD };
