// server.js
// This is the "open the shop" file. It:
//   1. reads the settings
//   2. opens the database
//   3. builds the app
//   4. starts listening for visitors on a port (a numbered door)

const { readConfig } = require('./config');
const { createLogger } = require('./logger');
const { createDatabase } = require('./db/database');
const { createApp } = require('./app');

const ONE_HOUR_MS = 60 * 60 * 1000;

const config = readConfig();
const logger = createLogger();

// If something crashes that nobody caught, write it in the diary before stopping.
process.on('uncaughtException', (error) => {
  logger.error('the app crashed', { error: error.message, stack: error.stack });
  process.exit(1);
});

if (config.sessionSecretWasGenerated) {
  logger.warn('No SESSION_SECRET was set, so a random one was made up. ' +
    'Copy .env.example to .env and set one.');
}

if (config.breakDatabase) {
  logger.warn('BREAK_DATABASE=true: every database call will fail (incident drill).');
}

const db = createDatabase(config.dbPath, { breakDatabase: config.breakDatabase });
const app = createApp({ db, config, logger });

// Once an hour, sweep away sessions that have expired.
function sweepExpiredSessions() {
  try {
    db.deleteExpiredSessions(Date.now());
  } catch (error) {
    logger.error('could not sweep expired sessions', { error: error.message });
  }
}
setInterval(sweepExpiredSessions, ONE_HOUR_MS).unref();

app.listen(config.port, () => {
  logger.info('server started', {
    url: `http://localhost:${config.port}`,
    environment: config.isProduction ? 'production' : 'development',
  });
});
