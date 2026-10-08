'use client';
// components/AddTodoForm.js
// The box where you type a new todo, and the "Add" button.

import { useState } from 'react';

// onAdd is a function the page gives us. It returns true if the todo was saved.
export default function AddTodoForm({ onAdd }) {
  // React remembers what's typed in the box.
  const [text, setText] = useState('');

  async function handleSubmit(event) {
    // Stop the browser from reloading the page.
    event.preventDefault();
    // Ask the page to save it, and wait to hear if it worked.
    const saved = await onAdd(text);
    // It worked! Empty the box so the next todo can be typed.
    // (If it didn't work, we keep the words so nothing is lost.)
    if (saved) {
      setText('');
    }
  }

  return (
    <form className="add-form" onSubmit={handleSubmit}>
      {/* A label for screen readers, hidden from eyes. */}
      <label htmlFor="todo-text" className="visually-hidden">
        What do you want to do?
      </label>
      <input
        id="todo-text"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="What do you want to do?"
        maxLength={200}
        required
      />
      <button type="submit">Add</button>
    </form>
  );
}
