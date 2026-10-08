// middleware/error-handler.js
// "Middleware" is a helper that every request walks past, like the
// security guard and the coat check at a museum entrance.
//
// These two helpers sit at the very END of the line:
//   notFound      -> nobody handled this URL, so answer 404
//   errorHandler  -> something crashed, so answer with a calm message
//
// SAFETY RULE: users only ever see a short, generic message.
// The scary details (what broke, where in the code) go into the logs,
// where only we can read them. Attackers learn nothing from our errors.

function notFound(req, res) {
  res.status(404).json({ error: 'There is nothing at this address.' });
}

function createErrorHandler(logger) {
  // Express knows this is an error handler because it has FOUR inputs.
  // eslint-disable-next-line no-unused-vars
  return function errorHandler(err, req, res, next) {
    // The JSON the browser sent was broken (e.g. a missing quote).
    // That's the sender's mistake, so it's a 400, not a crash.
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({ error: 'That request was not valid JSON.' });
    }

    // The package was too big to accept.
    if (err.type === 'entity.too.large') {
      return res.status(413).json({ error: 'That request was too big.' });
    }

    // Anything else is OUR mistake. Write ALL the details in the logs...
    logger.error('request failed', {
      requestId: req.id,
      method: req.method,
      path: req.path,
      error: err.message,
      stack: err.stack,
    });

    // ...but tell the user only a short, friendly message, plus the
    // request ID so they can tell us which visit went wrong.
    // 500 = "the server had a problem".
    res.status(500).json({
      error: 'Something went wrong on our side. Please try again.',
      requestId: req.id,
    });
  };
}

module.exports = { notFound, createErrorHandler };
