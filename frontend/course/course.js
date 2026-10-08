// course/course.js
// The JavaScript that makes the course experiments work.
// Like app.js, it puts text on the page with textContent (never innerHTML),
// so whatever you type is always shown as plain letters.

// ---------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------

// Make a new element, like <td>, with some text inside it.
function makeElement(tag, text, className) {
  const element = document.createElement(tag);
  // textContent = plain letters, always safe.
  element.textContent = text;
  if (className) {
    element.className = className;
  }
  return element;
}

// Add one row to a table: [name] [value] [explanation]
function addRow(tableBody, cells, className) {
  const row = document.createElement('tr');
  for (const cell of cells) {
    row.appendChild(makeElement('td', cell));
  }
  // Colour the first cell, so it matches the coloured URL.
  if (className) {
    row.firstChild.classList.add(className);
  }
  tableBody.appendChild(row);
}

// Ask our server for something and give back the status and the words.
async function askServer(path) {
  try {
    // fetch() sends a GET request, along with our cookies.
    const response = await fetch(path);
    const text = await response.text();
    return { status: response.status, statusText: response.statusText, text, headers: response.headers };
  } catch {
    // No answer at all: the server is switched off.
    return { status: 0, statusText: 'No answer', text: 'The server is taking a nap 😴', headers: new Headers() };
  }
}

// Make JSON easier to read by adding line breaks and spaces.
function prettyJson(text) {
  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    return text;
  }
}

// ---------------------------------------------------------------
// Quizzes (used on every lesson page)
// ---------------------------------------------------------------

function setUpQuizzes() {
  for (const quiz of document.querySelectorAll('[data-quiz]')) {
    const feedback = quiz.querySelector('.quiz-feedback');
    for (const button of quiz.querySelectorAll('button[data-answer]')) {
      button.addEventListener('click', () => {
        // Is this the right answer?
        const isRight = button.dataset.answer === 'right';
        // Colour the button green or red.
        button.classList.add(isRight ? 'is-right' : 'is-wrong');
        // Show the matching message (kept in data-right / data-wrong).
        feedback.textContent = isRight ? '✅ ' + feedback.dataset.right : '🤔 ' + feedback.dataset.wrong;
      });
    }
  }
}

// ---------------------------------------------------------------
// Lesson 5: URLs
// ---------------------------------------------------------------

// A pattern that splits a URL into its parts, exactly as it was typed:
//   scheme://host:port/path?query#fragment
const URL_PATTERN = /^([a-z][a-z0-9+.-]*:)\/\/([^/:?#]*)(:\d+)?([^?#]*)(\?[^#]*)?(#.*)?$/i;

// What each part means, in kid-friendly words.
const PART_INFO = {
  scheme: { name: 'Scheme', className: 'part-scheme', meaning: 'HOW to talk. https = the sealed envelope 🔒, http = the postcard 📮.' },
  host: { name: 'Host', className: 'part-host', meaning: 'WHICH computer. Like the town and street of a postal address.' },
  port: { name: 'Port', className: 'part-port', meaning: 'WHICH door on that computer. One computer can have lots of doors.' },
  path: { name: 'Path', className: 'part-path', meaning: 'WHICH thing you want on that computer, like a page or your todo list.' },
  query: { name: 'Query', className: 'part-query', meaning: 'EXTRA details, written as name=value and joined with &.' },
  fragment: { name: 'Fragment', className: 'part-fragment', meaning: 'A spot ON the page. Your browser keeps it; it is never sent to the server.' },
};

// When no port is written, everyone uses the usual door for that scheme.
function usualPort(scheme) {
  if (scheme === 'https:') {
    return '443';
  }
  if (scheme === 'http:') {
    return '80';
  }
  return '?';
}

// Read the address box and show the URL in colours, plus a table of its parts.
function explainUrl() {
  const input = document.getElementById('url-input');
  const colored = document.getElementById('url-colored');
  const table = document.getElementById('url-parts');
  const error = document.getElementById('url-error');

  // Start fresh each time.
  colored.replaceChildren();
  table.replaceChildren();
  error.textContent = '';

  const text = input.value.trim();
  // Split the URL into parts with our pattern.
  const match = URL_PATTERN.exec(text);
  // No match? Then it isn't a full web address.
  if (!match) {
    error.textContent = 'Hmm, that doesn\'t look like a full web address. Try starting with https://';
    return;
  }

  // Give each piece a name. Some may be missing (undefined).
  const parts = {
    scheme: match[1],
    host: match[2],
    port: match[3],
    path: match[4],
    query: match[5],
    fragment: match[6],
  };

  // Build the coloured URL, piece by piece, in order.
  colored.appendChild(makeElement('span', parts.scheme, 'part-scheme'));
  colored.appendChild(makeElement('span', '//', 'part-plain'));
  colored.appendChild(makeElement('span', parts.host, 'part-host'));
  for (const key of ['port', 'path', 'query', 'fragment']) {
    if (parts[key]) {
      colored.appendChild(makeElement('span', parts[key], PART_INFO[key].className));
    }
  }

  // Fill in the table, one row per part.
  addRow(table, [PART_INFO.scheme.name, parts.scheme.replace(':', ''), PART_INFO.scheme.meaning], 'part-scheme');
  addRow(table, [PART_INFO.host.name, parts.host, PART_INFO.host.meaning], 'part-host');

  // The port: either the one that was typed, or the usual one.
  const portText = parts.port
    ? parts.port.slice(1)
    : '(not written, so the usual door: ' + usualPort(parts.scheme) + ')';
  addRow(table, [PART_INFO.port.name, portText, PART_INFO.port.meaning], 'part-port');

  addRow(table, [PART_INFO.path.name, parts.path || '/', PART_INFO.path.meaning], 'part-path');

  // The query: show each name=value pair on its own.
  if (parts.query) {
    addRow(table, [PART_INFO.query.name, parts.query, PART_INFO.query.meaning], 'part-query');
    const pairs = new URLSearchParams(parts.query);
    for (const [name, value] of pairs) {
      addRow(table, ['', name + ' = ' + value, '"' + name + '" is set to "' + value + '"'], 'part-query');
    }
  } else {
    addRow(table, [PART_INFO.query.name, '(none)', PART_INFO.query.meaning], 'part-query');
  }

  addRow(table, [PART_INFO.fragment.name, parts.fragment || '(none)', PART_INFO.fragment.meaning], 'part-fragment');
}

// Make the "try it" buttons send real requests to our app.
function setUpTryButtons() {
  for (const button of document.querySelectorAll('[data-try]')) {
    button.addEventListener('click', async () => {
      const path = button.dataset.try;
      // Show the full URL we're asking for.
      document.getElementById('try-url').textContent = window.location.origin + path;
      document.getElementById('try-status').textContent = 'asking…';

      // Send the request and wait for the answer.
      const answer = await askServer(path);

      // Show the status code, like "200 OK" or "400 Bad Request".
      document.getElementById('try-status').textContent = answer.status + ' ' + answer.statusText;
      // Show what the server said, neatly laid out.
      document.getElementById('try-body').textContent = prettyJson(answer.text);
    });
  }
}

// Show the parts of THIS page's own address.
function showWhereWeAre() {
  const table = document.getElementById('here-parts');
  table.replaceChildren();
  // window.location is the browser's own breakdown of the address bar.
  const here = window.location;
  addRow(table, ['Scheme', here.protocol.replace(':', '')], 'part-scheme');
  addRow(table, ['Host', here.hostname], 'part-host');
  addRow(table, ['Port', here.port || '(the usual one)'], 'part-port');
  addRow(table, ['Path', here.pathname], 'part-path');
  addRow(table, ['Query', here.search || '(none)'], 'part-query');
  addRow(table, ['Fragment', here.hash || '(none)'], 'part-fragment');
}

function startUrlLesson() {
  const input = document.getElementById('url-input');
  // Re-explain the URL every time something is typed.
  input.addEventListener('input', explainUrl);

  // The example buttons fill in the box for you.
  for (const button of document.querySelectorAll('[data-example]')) {
    button.addEventListener('click', () => {
      input.value = button.dataset.example;
      explainUrl();
    });
  }

  // Adding a #fragment changes the address bar without reloading the page.
  document.getElementById('add-fragment').addEventListener('click', () => {
    window.location.hash = 'treasure';
  });
  // When the #fragment changes, update the table.
  window.addEventListener('hashchange', showWhereWeAre);

  setUpTryButtons();
  explainUrl();
  showWhereWeAre();
}

// ---------------------------------------------------------------
// Lesson 6: HTTPS
// ---------------------------------------------------------------

// The secret key for our pretend server. Made fresh each time the page loads.
let envelopeKey = null;
// The most recent sealed envelope: { iv, ciphertext }.
let latestEnvelope = null;

// Turn bytes into letters we can show (a format called base64).
function bytesToText(bytes) {
  let binary = '';
  for (const byte of new Uint8Array(bytes)) {
    binary = binary + String.fromCharCode(byte);
  }
  return window.btoa(binary);
}

// Seal the message in an "envelope" using real AES encryption.
async function sealMessage() {
  const message = document.getElementById('secret-input').value;
  // The postcard shows the message exactly as it is.
  document.getElementById('postcard-text').textContent = message;
  // Hide the old unlocked message.
  document.getElementById('unlocked-text').textContent = '';

  // An "IV" is a random starting point, so the same message never
  // scrambles the same way twice.
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const bytes = new TextEncoder().encode(message);
  const ciphertext = await window.crypto.subtle.encrypt({ name: 'AES-GCM', iv }, envelopeKey, bytes);

  latestEnvelope = { iv, ciphertext };
  // The envelope only shows scrambled nonsense.
  document.getElementById('envelope-text').textContent = bytesToText(ciphertext);
}

// Use the key to turn the scrambled message back into words.
async function unlockMessage() {
  if (!latestEnvelope) {
    return;
  }
  const bytes = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: latestEnvelope.iv },
    envelopeKey,
    latestEnvelope.ciphertext
  );
  document.getElementById('unlocked-text').textContent = '🔓 ' + new TextDecoder().decode(bytes);
}

async function setUpEnvelope() {
  // window.crypto.subtle is the browser's built-in encryption toolbox.
  // Browsers only allow it on "secure" pages (HTTPS, or localhost).
  if (!window.crypto || !window.crypto.subtle) {
    document.getElementById('envelope-text').textContent =
      'Your browser only allows encryption on secure pages. Open this page at http://localhost:3000 instead.';
    return;
  }
  // Make a brand-new secret key, like cutting a new key for a lock.
  envelopeKey = await window.crypto.subtle.generateKey({ name: 'AES-GCM', length: 128 }, false, [
    'encrypt',
    'decrypt',
  ]);
  document.getElementById('secret-input').addEventListener('input', sealMessage);
  document.getElementById('unlock-button').addEventListener('click', unlockMessage);
  await sealMessage();
}

// Show whether this page is using HTTPS, and explain the answer.
function showSecurityFacts() {
  const table = document.getElementById('security-facts');
  const here = window.location;
  const usesHttps = here.protocol === 'https:';
  const isLocalhost = here.hostname === 'localhost' || here.hostname === '127.0.0.1';

  addRow(table, ['Scheme of this page', here.protocol.replace(':', '')], 'part-scheme');
  addRow(table, ['Sealed envelope (HTTPS)?', usesHttps ? 'Yes 🔒' : 'No 📮']);
  addRow(table, ['Messages leave this computer?', isLocalhost ? 'No: localhost means "this computer"' : 'Yes']);
  // isSecureContext: the browser's own opinion on whether this page is safe.
  addRow(table, ['Browser thinks it\'s safe?', window.isSecureContext ? 'Yes ✅' : 'No ⚠️']);

  let explanation;
  if (usesHttps) {
    explanation = 'This page uses HTTPS. Everything between you and the server is in a sealed envelope. 🔒';
  } else if (isLocalhost) {
    explanation =
      'No padlock here, and that\'s OK! On localhost the messages never leave your computer, so there\'s ' +
      'nobody in the middle to snoop. On the real internet, our app would always use HTTPS.';
  } else {
    explanation =
      '⚠️ This page uses plain HTTP over a network. Anyone in the middle could read the postcards! ' +
      'A real site must use HTTPS.';
  }
  document.getElementById('security-explanation').textContent = explanation;
}

// Show which cookies JavaScript can see, and prove the hidden one still works.
async function checkCookies() {
  // document.cookie lists the cookies JavaScript is ALLOWED to read.
  const names = document.cookie
    .split(';')
    .map((part) => part.trim().split('=')[0])
    .filter((name) => name !== '');
  document.getElementById('visible-cookies').textContent =
    names.length > 0 ? names.join('\n') : '(none)';

  // Ask the server "who am I?". The browser sends the hidden sid cookie along.
  const answer = await askServer('/auth/me');
  const whoAmI = document.getElementById('who-am-i');
  const explanation = document.getElementById('cookie-explanation');

  if (answer.status === 200) {
    const user = JSON.parse(answer.text).user;
    whoAmI.textContent = 'Yes! You are logged in as "' + user.username + '".';
    explanation.textContent =
      'See? "sid" is NOT in the list, but the server still knows who you are. The browser sends ' +
      'the HttpOnly cookie to the server, but keeps it hidden from JavaScript. 🛡️';
  } else {
    whoAmI.textContent = 'No, you are not logged in. (Status ' + answer.status + ')';
    explanation.textContent =
      'Log in first (open the app in another tab), then press the button again.';
  }
}

// The security headers we look for, and what each one means.
const HEADER_INFO = [
  ['content-security-policy', 'Only run scripts that come from our own site.'],
  ['x-frame-options', 'Don\'t let other websites show us inside a frame (stops trick clicks).'],
  ['x-content-type-options', 'Don\'t guess what kind of file this is; trust what we say.'],
  ['referrer-policy', 'Don\'t tell other sites which page you came from.'],
  ['cross-origin-opener-policy', 'Keep our page separate from pages opened by other sites.'],
  ['strict-transport-security', 'Always use HTTPS from now on.'],
  ['x-request-id', 'Not for safety: a name tag for this request, to find it in the logs.'],
];

async function checkHeaders() {
  const table = document.getElementById('header-list');
  table.replaceChildren();
  // Ask for this page again, so we can read the headers on the answer.
  const answer = await askServer(window.location.pathname);

  for (const [name, meaning] of HEADER_INFO) {
    const value = answer.headers.get(name);
    if (value) {
      addRow(table, [name, value, meaning]);
    } else {
      addRow(table, [name, '(not sent)', meaning + ' We only send this when the site really has HTTPS.']);
    }
  }
}

function startHttpsLesson() {
  setUpEnvelope();
  showSecurityFacts();
  document.getElementById('check-cookies').addEventListener('click', checkCookies);
  document.getElementById('check-headers').addEventListener('click', checkHeaders);
}

// ---------------------------------------------------------------
// Start the right code for the page we're on
// ---------------------------------------------------------------

const coursePage = document.body.dataset.page;

setUpQuizzes();
if (coursePage === 'course-url') {
  startUrlLesson();
} else if (coursePage === 'course-https') {
  startHttpsLesson();
}
