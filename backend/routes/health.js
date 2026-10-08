// routes/health.js
// GET /health is the app's "I'm alive!" check, like a nurse taking
// your pulse. Cloud services call it every few seconds. If it stops
// saying "ok", they raise the alarm (or restart the app).
//
//   200 {"status":"ok"}         -> all good
//   503 {"status":"unhealthy"}  -> "Service Unavailable": something is wrong
//
// We don't just say "ok": we really ask the database a tiny question
// (SELECT 1). If the database is broken, the health check notices.

const express = require('express');

function createHealthRouter(db, logger) {
  const router = express.Router();

  router.get('/', (req, res) => {
    try {
      db.checkHealth();
      res.status(200).json({ status: 'ok' });
    } catch (error) {
      logger.error('health check failed', { requestId: req.id, error: error.message });
      res.status(503).json({ status: 'unhealthy' });
    }
  });

  return router;
}

module.exports = { createHealthRouter };
