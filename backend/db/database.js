// database.js
// This is the ONLY file that talks to the database.
// Every other file asks this one for help, like asking the librarian
// instead of climbing the shelves yourself.
//
// SAFETY RULE 1: every query uses "?" placeholders (called "parameters").
// We NEVER glue user text into SQL with +. Placeholders keep the user's
// words as plain data, so they can never be run as commands.
//
// SAFETY RULE 2: every todo query includes "user_id = ?", so a person
// can only ever see or change THEIR OWN todos.
//
// INCIDENT DRILL: start the app with BREAK_DATABASE=true and every
// database call fails on purpose, so we can practise fixing an outage.
// See lessons/20-incident-drill.md.

const fs = require('node:fs');
const path = require('node:path');
const Database = require('better-sqlite3');

const SCHEMA_FILE = path.join(__dirname, 'schema.sql');

// Open (or create) the database file and make sure the tables exist.
function openDatabase(dbPath) {
  // ":memory:" is a special name: a database that lives only in memory.
  // Tests use it so every test starts with a clean, empty database.
  if (dbPath !== ':memory:') {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  }

  const db = new Database(dbPath);
  db.pragma('foreign_keys = ON');
  stopIfDatabaseIsTooOld(db);
  db.exec(fs.readFileSync(SCHEMA_FILE, 'utf8'));
  return db;
}

// A database made by an early version of this app has todos without owners.
// Instead of guessing what to do, stop with a clear message.
function stopIfDatabaseIsTooOld(db) {
  const columns = db.prepare('PRAGMA table_info(todos)').all();
  const hasTodosTable = columns.length > 0;
  const hasOwnerColumn = columns.some((column) => column.name === 'user_id');

  if (hasTodosTable && !hasOwnerColumn) {
    throw new Error(
      'This database was made by an older version of the app. ' +
        'Delete the file (data/todos.db) and start the app again.'
    );
  }
}

// The database stores "completed" as 0 or 1.
// JavaScript likes true or false better, so we translate here.
function toTodo(row) {
  return {
    id: row.id,
    text: row.text,
    completed: row.completed === 1,
    createdAt: row.created_at,
  };
}

// Called first by every database function. When the drill switch is on,
// it pretends the database has gone away.
function checkDatabaseIsWorking(isBroken) {
  if (isBroken) {
    throw new Error(
      'SQLITE_CANTOPEN: unable to open database file ' +
        '(simulated outage because BREAK_DATABASE=true)'
    );
  }
}

// Wrap each function so it runs checkDatabaseIsWorking first.
// Writing it once here is safer than remembering it in 12 places.
function withOutageCheck(functions, isBroken) {
  const checked = {};
  for (const [name, fn] of Object.entries(functions)) {
    checked[name] = (...args) => {
      checkDatabaseIsWorking(isBroken);
      return fn(...args);
    };
  }
  return checked;
}

function createDatabase(dbPath, { breakDatabase = false } = {}) {
  const db = openDatabase(dbPath);

  // ---------- health ----------

  // Asks the database the smallest possible question. Throws if it can't answer.
  function checkHealth() {
    db.prepare('SELECT 1').get();
  }

  // ---------- users ----------

  // Returns the new user, or null if the username is already taken.
  function createUser(username, passwordHash) {
    try {
      const result = db
        .prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)')
        .run(username, passwordHash);
      return { id: Number(result.lastInsertRowid), username };
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return null;
      }
      throw error;
    }
  }

  // Returns { id, username, passwordHash } or null.
  function findUserByUsername(username) {
    const row = db
      .prepare('SELECT id, username, password_hash FROM users WHERE username = ?')
      .get(username);
    if (!row) {
      return null;
    }
    return { id: row.id, username: row.username, passwordHash: row.password_hash };
  }

  // ---------- sessions ----------

  function createSession(sessionId, userId, expiresAt) {
    db.prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)')
      .run(sessionId, userId, expiresAt);
  }

  // Returns the user who owns this session, or null if it is unknown or expired.
  function findUserBySession(sessionId, now) {
    const row = db
      .prepare(
        `SELECT users.id, users.username
           FROM sessions
           JOIN users ON users.id = sessions.user_id
          WHERE sessions.id = ? AND sessions.expires_at > ?`
      )
      .get(sessionId, now);
    if (!row) {
      return null;
    }
    return { id: row.id, username: row.username };
  }

  function deleteSession(sessionId) {
    db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId);
  }

  function deleteExpiredSessions(now) {
    db.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(now);
  }

  // ---------- todos (always for ONE user) ----------

  function createTodo(userId, text) {
    const result = db
      .prepare('INSERT INTO todos (user_id, text) VALUES (?, ?)')
      .run(userId, text);
    return findTodo(userId, result.lastInsertRowid);
  }

  // completed can be true, false, or undefined (meaning "show all").
  function listTodos(userId, { completed } = {}) {
    if (completed === undefined) {
      const rows = db
        .prepare('SELECT * FROM todos WHERE user_id = ? ORDER BY id')
        .all(userId);
      return rows.map(toTodo);
    }

    const rows = db
      .prepare('SELECT * FROM todos WHERE user_id = ? AND completed = ? ORDER BY id')
      .all(userId, completed ? 1 : 0);
    return rows.map(toTodo);
  }

  // Returns the todo, or null if this user has no todo with that id.
  function findTodo(userId, id) {
    const row = db
      .prepare('SELECT * FROM todos WHERE id = ? AND user_id = ?')
      .get(id, userId);
    if (!row) {
      return null;
    }
    return toTodo(row);
  }

  // changes looks like { text: 'new words' } or { completed: true } or both.
  // Returns the updated todo, or null if this user has no such todo.
  function updateTodo(userId, id, changes) {
    const current = findTodo(userId, id);
    if (!current) {
      return null;
    }

    const newText = changes.text !== undefined ? changes.text : current.text;
    const newCompleted =
      changes.completed !== undefined ? changes.completed : current.completed;

    db.prepare('UPDATE todos SET text = ?, completed = ? WHERE id = ? AND user_id = ?')
      .run(newText, newCompleted ? 1 : 0, id, userId);
    return findTodo(userId, id);
  }

  // Returns true if a todo was deleted, false if there was nothing to delete.
  function deleteTodo(userId, id) {
    const result = db
      .prepare('DELETE FROM todos WHERE id = ? AND user_id = ?')
      .run(id, userId);
    return result.changes === 1;
  }

  function close() {
    db.close();
  }

  return withOutageCheck({
    checkHealth,
    createUser,
    findUserByUsername,
    createSession,
    findUserBySession,
    deleteSession,
    deleteExpiredSessions,
    createTodo,
    listTodos,
    findTodo,
    updateTodo,
    deleteTodo,
    close,
  }, breakDatabase);
}

module.exports = { createDatabase };
