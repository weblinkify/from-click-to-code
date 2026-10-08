// config.js
// All the app's settings live here, in ONE place.
//
// The settings come from "environment variables": named values that are
// handed to the program when it starts (like writing instructions on a
// sticky note for whoever opens the shop today). Locally they come from
// the .env file; in the cloud they are set by the hosting service.

function readConfig(env = process.env) {
  return {
    // Which "door number" (port) the server listens on.
    port: Number(env.PORT) || 3000,
    // Where the database file lives.
    dbPath: env.DB_PATH || 'data/todos.db',
  };
}

module.exports = { readConfig };
