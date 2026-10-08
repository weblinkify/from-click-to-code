// routes/metrics.js
// GET /metrics shows our counters (see backend/metrics.js).
//
// NOTE: in a big real app, metrics are usually kept private (only the
// team's monitoring tools can read them). Here they're public so you can
// open http://localhost:3000/metrics and watch the numbers change.

const express = require('express');

function createMetricsRouter(metrics) {
  const router = express.Router();

  router.get('/', (req, res) => {
    res.status(200).json(metrics.snapshot());
  });

  return router;
}

module.exports = { createMetricsRouter };
