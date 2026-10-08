'use client';
// components/TodoItem.js
// ONE line of the list:  [checkbox] [words] [Delete]
//
// SAFETY: {todo.text} is shown by React as plain letters. Even if someone
// types <script>, React shows those letters and never runs them.

export default function TodoItem({ todo, onToggle, onDelete }) {
  // Done todos get a different look (crossed out).
  const className = todo.completed ? 'todo-item is-done' : 'todo-item';

  return (
    <li className={className}>
      <input
        type="checkbox"
        // Tick it if the todo is already done.
        checked={todo.completed}
        // A label for people who use screen readers.
        aria-label="Mark as done"
        // When it's clicked, tell the page (which tells the server).
        onChange={(event) => onToggle(todo.id, event.target.checked)}
      />
      <span className="todo-text">{todo.text}</span>
      <button type="button" className="delete-button" onClick={() => onDelete(todo.id)}>
        Delete
      </button>
    </li>
  );
}
