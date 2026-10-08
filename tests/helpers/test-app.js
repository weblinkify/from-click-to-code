// tests/helpers/test-app.js
// Builds a brand-new app with an EMPTY in-memory database for each test,
// so one test can never mess up another (like a fresh sheet of paper).

const assert = require('node:assert/strict');
const request = require('supertest');
const { createDatabase } = require('../../backend/db/database');
const { createApp } = require('../../backend/app');
const { readConfig } = require('../../backend/config');
const { createLogger } = require('../../backend/logger');
const { createMetrics } = require('../../backend/metrics');

const TEST_PASSWORD = 'correct-horse-battery';

// Settings for tests: a fixed secret, and fast (but still real) bcrypt.
function testConfig(overrides = {}) {
  return {
    ...readConfig({}),
    sessionSecret: 'test-secret',
    bcryptRounds: 4,
    ...overrides,
  };
}

// Log lines are caught in the "logs" list instead of filling the screen,
// so tests can read them.
function makeTestApp(configOverrides) {
  const config = testConfig(configOverrides);
  const db = createDatabase(':memory:', { breakDatabase: config.breakDatabase });
  const logs = [];
  const logger = createLogger({ write: (line) => logs.push(JSON.parse(line)) });
  const metrics = createMetrics();
  const app = createApp({ db, config, logger, metrics });
  return { app, db, config, logs, metrics, api: request(app) };
}

// A pretend browser: it keeps cookies between requests (like a real one)
// and does the CSRF handshake automatically on POST, PUT and DELETE.
async function makeBrowser(app) {
  const agent = request.agent(app);
  const res = await agent.get('/auth/csrf');
  const csrfToken = res.body.csrfToken;

  return {
    agent,
    csrfToken,
    get: (path) => agent.get(path),
    post: (path, body) => agent.post(path).set('X-CSRF-Token', csrfToken).send(body),
    put: (path, body) => agent.put(path).set('X-CSRF-Token', csrfToken).send(body),
    delete: (path) => agent.delete(path).set('X-CSRF-Token', csrfToken),
  };
}

// A pretend browser that has already signed up and is logged in.
async function signUp(app, username) {
  const browser = await makeBrowser(app);
  const res = await browser.post('/auth/signup', { username, password: TEST_PASSWORD });
  assert.equal(res.status, 201, `sign up as ${username} should work`);
  return browser;
}

module.exports = { makeTestApp, makeBrowser, signUp, TEST_PASSWORD };
