// lib/course/send.js
// The course's own way of sending requests. Unlike lib/api-client.js it
// gives back EVERYTHING (status, headers, raw words), so we can look
// inside the answer. Runs in the browser.

import { callApi } from '../api-client.js';

// Send through the normal app helper (with the CSRF handshake).
async function sendWithApp(method, url, body) {
  try {
    const result = await callApi(method, url, body);
    return {
      method,
      url,
      status: result.status,
      requestId: result.data.requestId,
      bodyText: JSON.stringify(result.data, null, 2),
      data: result.data,
    };
  } catch {
    return { method, url, status: 0, bodyText: 'The server is taking a nap 😴', data: {} };
  }
}

// Send with plain fetch(), with NO handshake: for showing what happens
// when the rules aren't followed.
async function sendRaw(method, url, { body, headers = {} } = {}) {
  const options = { method, headers: { ...headers } };
  if (body !== undefined) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }
  try {
    const response = await fetch(url, options);
    const text = await response.text();
    let pretty = text;
    let data = {};
    try {
      data = JSON.parse(text);
      pretty = JSON.stringify(data, null, 2);
    } catch {
      // Not JSON: show the words as they are.
    }
    return {
      method,
      url,
      status: response.status,
      requestId: response.headers.get('x-request-id'),
      headers: response.headers,
      bodyText: pretty,
      data,
    };
  } catch {
    return { method, url, status: 0, bodyText: 'The server is taking a nap 😴', data: {} };
  }
}

export { sendWithApp, sendRaw };
