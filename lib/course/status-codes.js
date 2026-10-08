// lib/course/status-codes.js
// What each status code means, in kid-friendly words.

const MEANINGS = {
  0: '😴 No answer at all. The server is switched off or can\'t be reached.',
  200: '🙂 OK! Here is what you asked for.',
  201: '🎉 Created! Something new now exists.',
  400: '🤔 Bad request: something in your request has a mistake in it.',
  401: '🎟️ Unauthorized: please log in first.',
  403: '🚫 Forbidden: the security handshake failed.',
  404: '🧭 Not found: there\'s nothing at that address (or it isn\'t yours).',
  409: '👯 Conflict: that clashes with something that already exists.',
  413: '📦 Too big: that request was too large.',
  429: '🚦 Too many requests: slow down and wait a bit.',
  500: '😵 Server error: something broke on the server (our fault, not yours).',
  503: '🚑 Service unavailable: the server is up but not healthy.',
};

function explainStatus(status) {
  if (MEANINGS[status]) {
    return MEANINGS[status];
  }
  if (status >= 200 && status < 300) {
    return '🙂 It worked (2xx).';
  }
  if (status >= 400 && status < 500) {
    return '🤔 Something was wrong with the request (4xx).';
  }
  return '😵 The server had a problem (5xx).';
}

export { explainStatus };
