-- schema.sql
-- This file describes the SHAPE of our data, like the column headings
-- on a paper chart. The database reads it when the app starts.
--
-- "IF NOT EXISTS" means: only build the table if it isn't there yet,
-- so starting the app twice never wipes out our todos.

-- Everyone who has signed up.
CREATE TABLE IF NOT EXISTS users (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,

  -- "COLLATE NOCASE" makes "Sam" and "sam" count as the same name.
  username       TEXT    NOT NULL UNIQUE COLLATE NOCASE,

  -- SAFETY: we never store the real password. We store a "hash", a
  -- scrambled fingerprint of it that cannot be turned back into the password.
  password_hash  TEXT    NOT NULL,

  created_at     TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Who is logged in right now. Each row is like a wristband at a theme park:
-- the browser shows the band (a long random id) and we look up who owns it.
CREATE TABLE IF NOT EXISTS sessions (
  id          TEXT    PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  -- When the wristband stops working (milliseconds since 1970).
  expires_at  INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS todos (
  -- Every todo gets its own number, like a ticket at the deli counter.
  id          INTEGER PRIMARY KEY AUTOINCREMENT,

  -- WHO this todo belongs to. Every todo query checks this.
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- The words of the todo. It must be 1 to 200 characters long.
  text        TEXT    NOT NULL CHECK (length(text) BETWEEN 1 AND 200),

  -- 0 means "not done yet", 1 means "done!".
  completed   INTEGER NOT NULL DEFAULT 0 CHECK (completed IN (0, 1)),

  -- When the todo was made (filled in automatically).
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- An "index" is like the index at the back of a book: it helps the
-- database find one person's todos quickly.
CREATE INDEX IF NOT EXISTS todos_by_user ON todos (user_id);
