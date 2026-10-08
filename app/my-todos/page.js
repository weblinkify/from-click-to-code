'use client';
// app/my-todos/page.js  ->  http://localhost:3000/my-todos
// The page where your list lives. This is the FRONTEND: it runs inside
// your web browser and talks to the backend (app/todos/route.js).
//
// How React works, in one sentence: we keep the data in "state", and
// whenever the state changes, React redraws the page to match it.
//
// SAFETY: React shows todo words as plain letters, never as code, so
// even if someone types <script>, nothing runs.

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AddTodoForm from '../../components/AddTodoForm.js';
import Filters from '../../components/Filters.js';
import TodoItem from '../../components/TodoItem.js';
import Message from '../../components/Message.js';
import { callApi, errorFrom, ServerDownError } from '../../lib/api-client.js';

// If the server is down, the banner already says so; ignore that error here.
function ignoreServerDown(error) {
  if (!(error instanceof ServerDownError)) {
    throw error;
  }
}

export default function MyTodosPage() {
  const router = useRouter();

  // ----- The page's memory ("state") -----
  // The list of todos the server gave us.
  const [todos, setTodos] = useState([]);
  // Which todos to show: "all", "true" (done) or "false" (not done yet).
  const [filter, setFilter] = useState('all');
  // Who is logged in (null until we know).
  const [username, setUsername] = useState(null);
  // A short message under the form, and whether it's good news.
  const [message, setMessage] = useState({ text: '', isGood: false });

  // Show a message. isGood makes it green instead of red.
  function showMessage(text, isGood = false) {
    setMessage({ text, isGood });
  }

  // Ask the server for the todos (with the chosen filter).
  const loadTodos = useCallback(async () => {
    // Start with the basic address...
    let path = '/todos';
    // ...and add "?completed=true" or "?completed=false" if a filter is picked.
    if (filter !== 'all') {
      path = path + '?completed=' + filter;
    }
    try {
      // GET means "please give me".
      const result = await callApi('GET', path);
      // Not logged in? Off to the login page.
      if (result.status === 401) {
        router.replace('/login');
        return;
      }
      // Any other problem? Show why and stop.
      if (!result.ok) {
        showMessage(errorFrom(result));
        return;
      }
      // Remember the list. React redraws the page with it.
      setTodos(result.data.todos);
    } catch (error) {
      ignoreServerDown(error);
    }
  }, [filter, router]);

  // When the page opens, find out who is logged in.
  useEffect(() => {
    async function greet() {
      try {
        // Ask the server "who am I?"
        const result = await callApi('GET', '/auth/me');
        // Not logged in? Off to the login page.
        if (result.status === 401) {
          router.replace('/login');
          return;
        }
        // Some other problem (like a 500)? Show the friendly message.
        if (!result.ok) {
          showMessage(errorFrom(result));
          return;
        }
        // Remember the name, so we can say hello.
        setUsername(result.data.user.username);
      } catch (error) {
        ignoreServerDown(error);
      }
    }
    greet();
  }, [router]);

  // Once we know who you are, and whenever the filter changes, load the list.
  useEffect(() => {
    if (username) {
      loadTodos();
    }
  }, [username, loadTodos]);

  // Send a new todo to the server. Returns true if it was saved.
  async function addTodo(text) {
    try {
      // POST means "here is something new to save".
      const result = await callApi('POST', '/todos', { text });
      // If the server said no (e.g. too long), show the reason.
      if (!result.ok) {
        showMessage(errorFrom(result));
        return false;
      }
      showMessage('Added! 🎉', true);
      // Load the list again so the new todo appears.
      await loadTodos();
      return true;
    } catch (error) {
      ignoreServerDown(error);
      return false;
    }
  }

  // Tell the server a todo is done (or not done).
  async function setCompleted(id, completed) {
    // Tick the box on the screen straight away, without waiting for the
    // server. This is called an "optimistic update": we hope it works, and
    // the reload below fixes the screen if it didn't.
    setTodos((current) => current.map((todo) => (todo.id === id ? { ...todo, completed } : todo)));
    try {
      // PUT means "change this one". The id goes in the address.
      const result = await callApi('PUT', '/todos/' + id, { completed });
      if (!result.ok) {
        showMessage(errorFrom(result));
      }
      // Reload so the line gets (or loses) its crossed-out look.
      await loadTodos();
    } catch (error) {
      ignoreServerDown(error);
    }
  }

  // Ask the server to delete a todo.
  async function deleteTodo(id) {
    try {
      // DELETE means "throw this one away".
      const result = await callApi('DELETE', '/todos/' + id);
      if (!result.ok) {
        showMessage(errorFrom(result));
      }
      // Reload so the todo disappears.
      await loadTodos();
    } catch (error) {
      ignoreServerDown(error);
    }
  }

  // Log out, then go back to the login page.
  async function logOut() {
    try {
      // POST to /auth/logout tells the server to forget our wristband.
      await callApi('POST', '/auth/logout');
      router.push('/login');
    } catch (error) {
      ignoreServerDown(error);
    }
  }

  // ----- What the page looks like -----
  // This HTML-looking code is called JSX. {curly braces} hold JavaScript.
  return (
    <main className="card">
      <header className="top-bar">
        <div>
          <h1>My todos</h1>
          {/* Only say hello once we know the name. */}
          {username && <p className="greeting">Hi, {username}!</p>}
        </div>
        <button type="button" className="secondary small" onClick={logOut}>
          Log out
        </button>
      </header>

      <AddTodoForm onAdd={addTodo} />
      <Message text={message.text} isGood={message.isGood} />
      <Filters current={filter} onChange={setFilter} />

      <ul className="todo-list">
        {/* Build one TodoItem for each todo in the list. */}
        {todos.map((todo) => (
          <TodoItem key={todo.id} todo={todo} onToggle={setCompleted} onDelete={deleteTodo} />
        ))}
      </ul>

      {/* If the list is empty, show a friendly note. */}
      {username && todos.length === 0 && (
        <p className="empty">Nothing here yet. Add your first todo above! 🌱</p>
      )}
    </main>
  );
}
