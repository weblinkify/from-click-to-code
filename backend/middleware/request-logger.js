// middleware/request-logger.js
// Every request gets a "request ID": a unique name tag, like the number
// on a cloakroom ticket. We:
//   1. make the ID
//   2. send it back to the browser in the "X-Request-Id" header
//   3. write one log line when the answer is finished
//
// If a user says "it broke!", their request ID lets us find the EXACT
// line in the logs that belongs to their visit.

const crypto = require('node:crypto');

function requestLogger(logger, metrics) {
  return function requestLoggerMiddleware(req, res, next) {
    const startTime = Date.now();
    // Remember the path now: routers change req.path as the request moves along.
    const path = req.path;

    req.id = crypto.randomUUID();
    res.set('X-Request-Id', req.id);

    // "finish" fires once the whole answer has been sent.
    res.on('finish', () => {
      metrics.increment('requestsTotal');
      if (res.statusCode >= 500) {
        metrics.increment('errorsTotal');
      }

      logger.info('request finished', {
        requestId: req.id,
        method: req.method,
        path,
        status: res.statusCode,
        ms: Date.now() - startTime,
      });
    });

    next();
  };
}

module.exports = { requestLogger };
