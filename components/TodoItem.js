'use client';
// components/TodoItem.js
// ONE line of the list:  [checkbox] [words] [Delete]
//
// SAFETY: {todo.text} is shown by React as plain letters. Even if someone
// types <script>, React shows those letters and never runs them.

export default function TodoItem({ todo, onToggle, onDelete }) {
  // Done todos get a different look (crossed out and grey).
  // ("todo-item" and "is-done" are plain names our tests look for.)
  const className = todo.completed ? 'todo-item is-done' : 'todo-item';
  const textStyle = todo.completed ? 'text-slate-400 line-through' : 'text-slate-800';

  return (
    <li className={`${className} flex items-center gap-3 py-3`}>
      <input
        type="checkbox"
        className="h-6 w-6 shrink-0 cursor-pointer accent-emerald-600"
        // Tick it if the todo is already done.
        checked={todo.completed}
        // A label for people who use screen readers.
        aria-label="Mark as done"
        // When it's clicked, tell the page (which tells the server).
        onChange={(event) => onToggle(todo.id, event.target.checked)}
      />
      <span className={`todo-text grow break-words ${textStyle}`}>{todo.text}</span>
      <button
        type="button"
        className="delete-button rounded-lg border border-rose-200 px-3 py-1 text-sm font-bold text-rose-600 hover:bg-rose-600 hover:text-white"
        onClick={() => onDelete(todo.id)}
      >
        Delete
      </button>
    </li>
  );
}
