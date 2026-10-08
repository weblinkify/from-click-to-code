// lib/context.js
// The "context" is the set of shared things every API route needs:
//   config   -> the settings (from .env)
//   db       -> the database helper
//   logger   -> the diary
//   metrics  -> the counters
//   loginRateLimiter -> remembers login tries
//
// We make them ONCE and share them, like one school library for the whole
// school instead of one per classroom.
//
// Why globalThis? Next.js may load our files more than once (for example
// one copy per route). Keeping the context on globalThis means every copy
// shares the same database connection and the same counters.

import { readConfig } from './config.js';
import { createLogger } from './logger.js';
import { createMetrics } from './metrics.js';
import { createRateLimiter } from './rate-limit.js';
import { createDatabase } from './db/database.js';

const CONTEXT_KEY = Symbol.for('kids-todo-app.context');
const ONE_HOUR_MS = 60 * 60 * 1000;

// Build a context. Tests call this with their own config and logger.
function buildContext({ config = readConfig(), logger = createLogger() } = {}) {
  const db = createDatabase(config.dbPath, { breakDatabase: config.breakDatabase });
  return {
    config,
    db,
    logger,
    metrics: createMetrics(),
    loginRateLimiter: createRateLimiter({
      maxAttempts: config.loginMaxAttempts,
      windowMs: config.loginWindowMs,
    }),
  };
}

// The first time the real app needs the context, make it and say hello.
function startRealContext() {
  const context = buildContext();
  const { config, logger, db } = context;

  if (config.sessionSecretWasGenerated) {
    logger.warn('No SESSION_SECRET was set, so a random one was made up. ' +
      'Copy .env.example to .env and set one.');
  }
  if (config.breakDatabase) {
    logger.warn('BREAK_DATABASE=true: every database call will fail (incident drill).');
  }

  // Once an hour, sweep away sessions that have expired.
  const sweep = () => {
    try {
      db.deleteExpiredSessions(Date.now());
    } catch (error) {
      logger.error('could not sweep expired sessions', { error: error.message });
    }
  };
  setInterval(sweep, ONE_HOUR_MS).unref();

  return context;
}

function getContext() {
  if (!globalThis[CONTEXT_KEY]) {
    globalThis[CONTEXT_KEY] = startRealContext();
  }
  return globalThis[CONTEXT_KEY];
}

// Tests use this to give every test a fresh, empty context.
function setContext(context) {
  globalThis[CONTEXT_KEY] = context;
}

export { buildContext, getContext, setContext };
