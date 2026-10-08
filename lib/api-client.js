// lib/api-client.js
// The FRONTEND's helper for talking to our API. It runs in the browser.
//
// It does three jobs so the rest of the frontend doesn't have to:
//   1. sends the request with fetch() and reads the JSON answer
//   2. adds the CSRF "secret handshake" token to every change
//   3. tells the page when the server can't be reached at all
//      (the ServerDownBanner component listens for that news)

// A special error we use when the server cannot be reached at all.
class ServerDownError extends Error {}

// The name of the "news" we announce when the server goes down or comes back.
const SERVER_STATUS_EVENT = 'kids-todo:server-status';

// Tell anyone listening whether the server is reachable.
function announceServerStatus(isDown) {
  window.dispatchEvent(new CustomEvent(SERVER_STATUS_EVENT, { detail: { isDown } }));
}

// The "secret handshake" token (see lib/csrf.js).
// We must show it every time we ask the server to CHANGE something.
let csrfToken = null;

// Send ONE request to our backend and give back its answer.
async function sendRequest(method, path, body) {
  const options = { method, headers: {} };

  // If we have something to send, wrap it up as JSON text.
  if (body !== undefined) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }

  // Requests that CHANGE things carry the handshake token in a header.
  if (method !== 'GET' && csrfToken) {
    options.headers['X-CSRF-Token'] = csrfToken;
  }

  let response;
  try {
    // fetch() sends the request and waits for the answer.
    response = await fetch(path, options);
  } catch {
    // fetch only lands here when there's NO answer at all (server is down).
    announceServerStatus(true);
    throw new ServerDownError('The server could not be reached.');
  }

  // We got an answer, so the server is awake.
  announceServerStatus(false);

  // Read the answer's JSON. Some answers might have none, so be careful.
  const data = await response.json().catch(() => ({}));
  return { status: response.status, ok: response.ok, data };
}

// Ask the server for a fresh handshake token.
async function fetchCsrfToken() {
  const result = await sendRequest('GET', '/auth/csrf');
  csrfToken = result.data.csrfToken;
}

// The helper the pages use. It takes care of the handshake token for us.
async function callApi(method, path, body) {
  // Changing something? Make sure we have a handshake token first.
  if (method !== 'GET' && !csrfToken) {
    await fetchCsrfToken();
  }

  let result = await sendRequest(method, path, body);

  // 403 can mean our token went stale (e.g. the server restarted).
  // Get a fresh one and try ONE more time.
  if (result.status === 403 && method !== 'GET') {
    await fetchCsrfToken();
    result = await sendRequest(method, path, body);
  }
  return result;
}

// Pick a friendly message out of a server answer.
function errorFrom(result) {
  const message = result.data.error || 'Oops, something went wrong. Please try again.';
  // When the server had a problem, it also sends a request ID. We show
  // the start of it as a "help code" so grown-ups can find it in the logs.
  if (result.data.requestId) {
    return message + ' (Help code: ' + result.data.requestId.slice(0, 8) + ')';
  }
  return message;
}

export { callApi, errorFrom, ServerDownError, SERVER_STATUS_EVENT };
