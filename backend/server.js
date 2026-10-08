// server.js
// This is the "open the shop" file. It:
//   1. reads the settings
//   2. opens the database
//   3. builds the app
//   4. starts listening for visitors on a port (a numbered door)

const { readConfig } = require('./config');
const { createDatabase } = require('./db/database');
const { createApp } = require('./app');

const config = readConfig();
const db = createDatabase(config.dbPath);
const app = createApp({ db });

app.listen(config.port, () => {
  console.log(`Kids Todo App is running at http://localhost:${config.port}`);
});
