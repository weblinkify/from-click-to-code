// app/metrics/route.js  ->  GET /metrics
// Shows our counters (see lib/metrics.js), like a car's dashboard.
//
// NOTE: in a big real app, metrics are usually kept private (only the
// team's monitoring tools can read them). Here they're public so you can
// watch the numbers change, e.g. on the /course/incident page.

import { withApi, reply } from '../../lib/api.js';

async function showMetrics(call) {
  return reply(200, call.context.metrics.snapshot());
}

export const GET = withApi(showMetrics, { skipSession: true });
