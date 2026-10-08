-- schema.sql
-- This file describes the SHAPE of our data, like the column headings
-- on a paper chart. The database reads it when the app starts.
--
-- "IF NOT EXISTS" means: only build the table if it isn't there yet,
-- so starting the app twice never wipes out our todos.

CREATE TABLE IF NOT EXISTS todos (
  -- Every todo gets its own number, like a ticket at the deli counter.
  id          INTEGER PRIMARY KEY AUTOINCREMENT,

  -- The words of the todo. It must be 1 to 200 characters long.
  text        TEXT    NOT NULL CHECK (length(text) BETWEEN 1 AND 200),

  -- 0 means "not done yet", 1 means "done!".
  completed   INTEGER NOT NULL DEFAULT 0 CHECK (completed IN (0, 1)),

  -- When the todo was made (filled in automatically).
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);
