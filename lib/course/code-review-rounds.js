// lib/course/code-review-rounds.js
// The rounds of the "Spot the bug" code review game.
// Each round is one of the files in bad-examples/, shortened to fit.
//
//   lines       -> the code to review, one line per entry
//   buggyLines  -> which line numbers (starting at 1) hold the mistake
//   hint        -> a nudge if you guess wrong
//   problem     -> what could go wrong (harmless examples only)
//   fixedLines  -> the safe version
//   badExample  -> the full write-up in bad-examples/

const ROUNDS = [
  {
    id: 'sql-injection',
    title: 'The search box',
    story: 'Your friend wrote a function that finds todos containing a word.',
    lines: [
      'function searchTodos(userId, word) {',
      '  const sql =',
      '    "SELECT * FROM todos WHERE user_id = " + userId +',
      '    " AND text LIKE \'%" + word + "%\'";',
      '  return db.prepare(sql).all();',
      '}',
    ],
    buggyLines: [3, 4],
    hint: 'Look at how the SQL sentence is built. What if "word" contains a \' quote?',
    problem:
      'The user\'s words are GLUED into the SQL with +. Searching for  \' OR \'1\'=\'1  ' +
      'turns the question into "...or 1 equals 1", which is always true, so it could show ' +
      'EVERYONE\'s todos. This is called SQL injection.',
    fixedLines: [
      'function searchTodos(userId, word) {',
      "  return db",
      "    .prepare('SELECT * FROM todos WHERE user_id = ? AND text LIKE ?')",
      "    .all(userId, '%' + word + '%');",
      '}',
    ],
    fixNote: 'The ? placeholders keep the user\'s words as plain data. They can never become part of the command.',
    badExample: 'bad-examples/01-sql-injection.md',
    realCode: 'lib/db/database.js',
  },
  {
    id: 'xss',
    title: 'Showing a todo',
    story: 'This (non-React) code puts a todo on the page.',
    lines: [
      'function showTodo(todo) {',
      "  const item = document.createElement('li');",
      '  item.innerHTML = todo.text;',
      '  list.appendChild(item);',
      '}',
    ],
    buggyLines: [3],
    hint: 'Which line decides HOW the words get onto the page?',
    problem:
      'innerHTML treats the words as HTML CODE. A todo like  <img src="nope" onerror="alert(\'hi\')">  ' +
      'would RUN code in everyone\'s browser that sees it. This is called XSS (cross-site scripting).',
    fixedLines: [
      'function showTodo(todo) {',
      "  const item = document.createElement('li');",
      '  item.textContent = todo.text;',
      '  list.appendChild(item);',
      '}',
    ],
    fixNote: 'textContent shows plain letters. In React, {todo.text} does the same thing automatically.',
    badExample: 'bad-examples/02-xss-innerhtml.md',
    realCode: 'components/TodoItem.js',
  },
  {
    id: 'owner-check',
    title: 'Deleting a todo',
    story: 'This route deletes a todo. The user IS logged in. What\'s missing?',
    lines: [
      'async function deleteTodo(call) {',
      '  const id = Number(call.params.id);',
      "  db.prepare('DELETE FROM todos WHERE id = ?').run(id);",
      '  return reply(200, { deleted: true });',
      '}',
    ],
    buggyLines: [3],
    hint: 'WHOSE todo gets deleted? Does the code ever check?',
    problem:
      'It never checks who OWNS the todo. Alice could send DELETE /todos/42 and delete Bob\'s todo ' +
      'just by changing a number. This is called IDOR.',
    fixedLines: [
      'async function deleteTodo(call) {',
      '  const id = Number(call.params.id);',
      '  const result = db',
      "    .prepare('DELETE FROM todos WHERE id = ? AND user_id = ?')",
      '    .run(id, call.user.id);',
      '  if (result.changes === 0) {',
      "    return reply(404, { error: 'Todo not found.' });",
      '  }',
      '  return reply(200, { deleted: true });',
      '}',
    ],
    fixNote: 'Every todo query includes "user_id = ?", and someone else\'s todo is simply "not found".',
    badExample: 'bad-examples/03-missing-owner-check.md',
    realCode: 'app/todos/[id]/route.js',
  },
  {
    id: 'plain-passwords',
    title: 'Signing up',
    story: 'This saves a new user. The SQL uses ? placeholders, so that part is safe...',
    lines: [
      'function signUp(username, password) {',
      '  db.prepare(',
      "    'INSERT INTO users (username, password) VALUES (?, ?)'",
      '  ).run(username, password);',
      '}',
    ],
    buggyLines: [3, 4],
    hint: 'What exactly ends up stored in the database?',
    problem:
      'The password is stored EXACTLY as typed. Anyone who ever sees the database can read every ' +
      'password, and people often use the same password everywhere.',
    fixedLines: [
      'async function signUp(username, password) {',
      '  const passwordHash = await bcrypt.hash(password, 12);',
      '  db.prepare(',
      "    'INSERT INTO users (username, password_hash) VALUES (?, ?)'",
      '  ).run(username, passwordHash);',
      '}',
    ],
    fixNote: 'bcrypt turns the password into a "smoothie" (a hash) that can\'t be turned back into the password.',
    badExample: 'bad-examples/04-plain-text-passwords.md',
    realCode: 'app/auth/signup/route.js',
  },
  {
    id: 'api-key',
    title: 'The weather helper',
    story: 'This gets the weather from another company\'s service. It works perfectly!',
    lines: [
      "const WEATHER_API_KEY = 'pretend-key-1234-not-real';",
      '',
      'async function getWeather(city) {',
      "  const url = 'https://weather.example.com/today?city=' +",
      "    city + '&key=' + WEATHER_API_KEY;",
      '  return fetch(url);',
      '}',
    ],
    buggyLines: [1],
    hint: 'Is there anything here that should be kept secret?',
    problem:
      'The secret key is written IN the code. Once it\'s pushed to GitHub it stays in the history ' +
      'forever, and robots scan GitHub for keys all day.',
    fixedLines: [
      'const WEATHER_API_KEY = process.env.WEATHER_API_KEY;',
      '',
      'async function getWeather(city) {',
      "  const url = 'https://weather.example.com/today?city=' +",
      "    encodeURIComponent(city) + '&key=' + WEATHER_API_KEY;",
      '  return fetch(url);',
      '}',
    ],
    fixNote: 'Secrets live in .env (which Git ignores) or in the cloud\'s secret store. A leaked key must be cancelled.',
    badExample: 'bad-examples/05-hardcoded-api-key.md',
    realCode: 'lib/config.js',
  },
  {
    id: 'messy',
    title: 'The mystery function',
    story: 'No security hole here, but would you want to work on this?',
    lines: [
      'async function doIt(a, b, c) {',
      "  const x = await db.prepare('SELECT * FROM todos WHERE user_id = ?').all(a);",
      '  let y = x.filter(z => b ? z.completed == 1 : true).map(z => ({...z, t: z.text.substring(0, c || 200)}));',
      '  if (y.length > 0) { return y } else return y;',
      '}',
    ],
    buggyLines: [1, 3],
    hint: 'Try explaining what a, b, c, x, y and z mean. Which line is hardest to read?',
    problem:
      'Names like doIt, a, b, c, x, y and z say nothing. Line 3 does five jobs in one go. ' +
      'Messy code is where bugs hide, and nobody can safely change it.',
    fixedLines: [
      '// Get one user\'s todos, optionally only the finished ones.',
      'function listTodos(userId, { onlyCompleted = false } = {}) {',
      '  const rows = db',
      "    .prepare('SELECT * FROM todos WHERE user_id = ? ORDER BY id')",
      '    .all(userId);',
      '  if (onlyCompleted) {',
      '    return rows.filter((row) => row.completed === 1);',
      '  }',
      '  return rows;',
      '}',
    ],
    fixNote: 'Clear names, one job per line, and a comment saying why. Kind reviewers ask for this.',
    badExample: 'bad-examples/06-messy-function.md',
    realCode: 'lib/db/database.js',
  },
];

export { ROUNDS };
