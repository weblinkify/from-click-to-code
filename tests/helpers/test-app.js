// tests/helpers/test-app.js
// Builds a brand-new app with an EMPTY in-memory database for each test,
// so one test can never mess up another (like a fresh sheet of paper).

const request = require('supertest');
const { createDatabase } = require('../../backend/db/database');
const { createApp } = require('../../backend/app');

function makeTestApp() {
  const db = createDatabase(':memory:');
  const app = createApp({ db });
  return { app, db, api: request(app) };
}

module.exports = { makeTestApp };
