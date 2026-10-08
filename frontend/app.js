// app.js
// This is the JavaScript for the FRONTEND: the part of the app that runs
// inside your web browser. It makes the pages come alive.
//
// Its two big jobs:
//   1. Talk to the backend (the server) using "fetch".
//   2. Change what is on the page when something happens.
//
// SAFETY RULE: we put todo words on the page with textContent, never
// innerHTML. textContent treats words as plain words, so even if someone
// types <script>, the browser just shows those letters and never runs them.

// ---------------------------------------------------------------
// Part 1: talking to the server
// ---------------------------------------------------------------

// A special error we use when the server cannot be reached at all.
class ServerDownError extends Error {}

// Send a request to our backend and give back its answer.
// method is "GET", "POST", "PUT" or "DELETE". body is optional.
async function callApi(method, path, body) {
  // These are the details we send along with the request.
  const options = {
    method: method,
    headers: {},
  };

  // If we have something to send, wrap it up as JSON text.
  if (body !== undefined) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }

  let response;
  try {
    // fetch() sends the request across the internet and waits for an answer.
    response = await fetch(path, options);
  } catch {
    // fetch only lands here when there's NO answer at all (server is down).
    showServerDown();
    throw new ServerDownError('The server could not be reached.');
  }

  // We got an answer, so the server is awake. Hide the warning if it was showing.
  hideServerDown();

  // Read the answer's JSON. Some answers might have none, so be careful.
  const data = await response.json().catch(() => ({}));

  // Give back the status code (like 200 or 400) and the data together.
  return { status: response.status, ok: response.ok, data: data };
}

// ---------------------------------------------------------------
// Part 2: small helpers for showing messages
// ---------------------------------------------------------------

// Show the yellow "server is taking a nap" strip at the top of the page.
function showServerDown() {
  const banner = document.getElementById('server-message');
  // textContent puts plain words in the box (safe!).
  banner.textContent =
    "😴 The server is taking a nap and we can't reach it. Please try again in a minute.";
  // Un-hide the box so people can see it.
  banner.hidden = false;
}

// Hide the yellow strip again.
function hideServerDown() {
  const banner = document.getElementById('server-message');
  banner.hidden = true;
}

// Show a short message under a form. isGood makes it green instead of red.
function showMessage(text, isGood) {
  const box = document.getElementById('form-message');
  // Some pages have no message box, so check first.
  if (!box) {
    return;
  }
  box.textContent = text;
  // Add or remove the green colour.
  box.classList.toggle('is-good', Boolean(isGood));
}

// Pick a friendly message out of a server answer.
function errorFrom(result) {
  // The server puts its message in "error". If it didn't, use our own.
  return result.data.error || 'Oops, something went wrong. Please try again.';
}

// ---------------------------------------------------------------
// Part 3: the todos page
// ---------------------------------------------------------------

// Which todos to show: "all", "true" (done) or "false" (not done yet).
let currentFilter = 'all';

// Ask the server for the todos and draw them on the page.
async function loadTodos() {
  // Start with the basic address...
  let path = '/todos';
  // ...and add "?completed=true" or "?completed=false" if a filter is picked.
  if (currentFilter !== 'all') {
    path = path + '?completed=' + currentFilter;
  }

  try {
    // Ask the server (GET means "please give me").
    const result = await callApi('GET', path);
    // If the server said no, show why and stop.
    if (!result.ok) {
      showMessage(errorFrom(result));
      return;
    }
    // Draw the list we got back.
    renderTodos(result.data.todos);
  } catch (error) {
    // The server is down. The yellow banner is already showing.
    if (!(error instanceof ServerDownError)) {
      throw error;
    }
  }
}

// Draw every todo as a line in the list.
function renderTodos(todos) {
  const list = document.getElementById('todo-list');
  // Throw away the old lines first, so nothing appears twice.
  list.replaceChildren();

  // Build one line for each todo.
  for (const todo of todos) {
    list.appendChild(buildTodoItem(todo));
  }

  // If the list is empty, show the "nothing here yet" note.
  const emptyMessage = document.getElementById('empty-message');
  emptyMessage.hidden = todos.length > 0;
}

// Build ONE line of the list: [checkbox] [words] [Delete]
function buildTodoItem(todo) {
  // <li> is a "list item", one line in a list.
  const item = document.createElement('li');
  item.className = 'todo-item';
  // Done todos get a different look (crossed out).
  if (todo.completed) {
    item.classList.add('is-done');
  }

  // The tick box.
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  // Tick it if the todo is already done.
  checkbox.checked = todo.completed;
  // A label for people who use screen readers.
  checkbox.setAttribute('aria-label', 'Mark as done');
  // When it's clicked, tell the server.
  checkbox.addEventListener('change', () => setCompleted(todo.id, checkbox.checked));

  // The words of the todo.
  const text = document.createElement('span');
  text.className = 'todo-text';
  // SAFE: textContent shows the words exactly as typed and never runs them as code.
  text.textContent = todo.text;

  // The delete button.
  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.className = 'delete-button';
  deleteButton.textContent = 'Delete';
  // When it's clicked, ask the server to remove this todo.
  deleteButton.addEventListener('click', () => deleteTodo(todo.id));

  // Put the three pieces inside the line, in order.
  item.append(checkbox, text, deleteButton);
  return item;
}

// Send a new todo to the server.
async function addTodo(event) {
  // Stop the browser from reloading the page (that's what forms do by default).
  event.preventDefault();

  const input = document.getElementById('todo-text');
  try {
    // POST means "here is something new to save".
    const result = await callApi('POST', '/todos', { text: input.value });
    // If the server said no (e.g. too long), show the reason.
    if (!result.ok) {
      showMessage(errorFrom(result));
      return;
    }
    // It worked! Empty the box so the next todo can be typed.
    input.value = '';
    showMessage('Added! 🎉', true);
    // Draw the list again so the new todo appears.
    await loadTodos();
  } catch (error) {
    if (!(error instanceof ServerDownError)) {
      throw error;
    }
  }
}

// Tell the server a todo is done (or not done).
async function setCompleted(id, completed) {
  try {
    // PUT means "change this one". The id goes in the address.
    const result = await callApi('PUT', '/todos/' + id, { completed: completed });
    if (!result.ok) {
      showMessage(errorFrom(result));
    }
    // Redraw so the line gets (or loses) its crossed-out look.
    await loadTodos();
  } catch (error) {
    if (!(error instanceof ServerDownError)) {
      throw error;
    }
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
    // Redraw so the todo disappears.
    await loadTodos();
  } catch (error) {
    if (!(error instanceof ServerDownError)) {
      throw error;
    }
  }
}

// Make the "All / To do / Done" buttons work.
function setUpFilters() {
  const buttons = document.querySelectorAll('.filter');
  for (const button of buttons) {
    button.addEventListener('click', () => {
      // Remember which filter was picked ("all", "true" or "false").
      currentFilter = button.dataset.filter;
      // Light up only the button that was clicked.
      for (const other of buttons) {
        other.classList.toggle('is-active', other === button);
      }
      // Fetch the list again with the new filter.
      loadTodos();
    });
  }
}

function startTodosPage() {
  // When the "Add" form is sent, run addTodo.
  document.getElementById('add-todo-form').addEventListener('submit', addTodo);
  setUpFilters();
  // Logging out arrives in a later step of the project.
  document.getElementById('logout-button').addEventListener('click', () => {
    showMessage('Logging out is coming soon!');
  });
  // Load the list as soon as the page opens.
  loadTodos();
}

// ---------------------------------------------------------------
// Part 4: the login page
// ---------------------------------------------------------------

function startLoginPage() {
  // Accounts arrive in a later step of the project.
  for (const id of ['login-form', 'signup-form']) {
    document.getElementById(id).addEventListener('submit', (event) => {
      event.preventDefault();
      showMessage('Accounts are coming soon! For now, go straight to your todos.');
    });
  }
}

// ---------------------------------------------------------------
// Part 5: start the right code for the page we're on
// ---------------------------------------------------------------

// Each HTML page has <body data-page="...">, which tells us where we are.
const page = document.body.dataset.page;

if (page === 'todos') {
  startTodosPage();
} else if (page === 'login') {
  startLoginPage();
}
