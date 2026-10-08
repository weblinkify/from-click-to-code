// database.js
// This is the ONLY file that talks to the database.
// Every other file asks this one for help, like asking the librarian
// instead of climbing the shelves yourself.
//
// SAFETY RULE: every query uses "?" placeholders (called "parameters").
// We NEVER glue user text into SQL with +. Placeholders keep the user's
// words as plain data, so they can never be run as commands.

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
  db.exec(fs.readFileSync(SCHEMA_FILE, 'utf8'));
  return db;
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

function createDatabase(dbPath) {
  const db = openDatabase(dbPath);

  function createTodo(text) {
    const result = db
      .prepare('INSERT INTO todos (text) VALUES (?)')
      .run(text);
    return findTodo(result.lastInsertRowid);
  }

  // completed can be true, false, or undefined (meaning "show all").
  function listTodos({ completed } = {}) {
    if (completed === undefined) {
      const rows = db.prepare('SELECT * FROM todos ORDER BY id').all();
      return rows.map(toTodo);
    }

    const rows = db
      .prepare('SELECT * FROM todos WHERE completed = ? ORDER BY id')
      .all(completed ? 1 : 0);
    return rows.map(toTodo);
  }

  // Returns the todo, or null if there is no todo with that id.
  function findTodo(id) {
    const row = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
    if (!row) {
      return null;
    }
    return toTodo(row);
  }

  // changes looks like { text: 'new words' } or { completed: true } or both.
  // Returns the updated todo, or null if it was not found.
  function updateTodo(id, changes) {
    const current = findTodo(id);
    if (!current) {
      return null;
    }

    const newText = changes.text !== undefined ? changes.text : current.text;
    const newCompleted =
      changes.completed !== undefined ? changes.completed : current.completed;

    db.prepare('UPDATE todos SET text = ?, completed = ? WHERE id = ?')
      .run(newText, newCompleted ? 1 : 0, id);
    return findTodo(id);
  }

  // Returns true if a todo was deleted, false if there was nothing to delete.
  function deleteTodo(id) {
    const result = db.prepare('DELETE FROM todos WHERE id = ?').run(id);
    return result.changes === 1;
  }

  function close() {
    db.close();
  }

  return { createTodo, listTodos, findTodo, updateTodo, deleteTodo, close };
}

module.exports = { createDatabase };
