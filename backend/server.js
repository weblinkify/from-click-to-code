// server.js
// This is the "open the shop" file. It:
//   1. reads the settings
//   2. opens the database
//   3. builds the app
//   4. starts listening for visitors on a port (a numbered door)

const { readConfig } = require('./config');
const { createDatabase } = require('./db/database');
const { createApp } = require('./app');

const ONE_HOUR_MS = 60 * 60 * 1000;

const config = readConfig();

if (config.sessionSecretWasGenerated) {
  console.warn(
    'No SESSION_SECRET was set, so a random one was made up. ' +
      'Copy .env.example to .env and set one.'
  );
}

const db = createDatabase(config.dbPath);
const app = createApp({ db, config });

// Once an hour, sweep away sessions that have expired.
setInterval(() => db.deleteExpiredSessions(Date.now()), ONE_HOUR_MS).unref();

app.listen(config.port, () => {
  console.log(`Kids Todo App is running at http://localhost:${config.port}`);
});
