// app/health/route.js  ->  GET /health
// The app's "I'm alive!" check, like a nurse taking your pulse. Cloud
// services call it every few seconds. If it stops saying "ok", they raise
// the alarm (or restart the app).
//
//   200 {"status":"ok"}         -> all good
//   503 {"status":"unhealthy"}  -> "Service Unavailable": something is wrong
//
// We don't just say "ok": we really ask the database a tiny question
// (SELECT 1). If the database is broken, the health check notices.

import { withApi, reply } from '../../lib/api.js';

async function checkHealth(call) {
  try {
    call.context.db.checkHealth();
    return reply(200, { status: 'ok' });
  } catch (error) {
    call.context.logger.error('health check failed', {
      requestId: call.requestId,
      error: error.message,
    });
    return reply(503, { status: 'unhealthy' });
  }
}

export const GET = withApi(checkHealth, { skipSession: true });
