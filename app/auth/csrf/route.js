// app/auth/csrf/route.js  ->  GET /auth/csrf
// Hands out a fresh "secret handshake" token. See lib/csrf.js.

import { withApi, reply } from '../../../lib/api.js';
import { issueCsrfToken } from '../../../lib/csrf.js';

async function sendCsrfToken(call) {
  const token = issueCsrfToken(call);
  return reply(200, { csrfToken: token });
}

export const GET = withApi(sendCsrfToken, { skipSession: true });
