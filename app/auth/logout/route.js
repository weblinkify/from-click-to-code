// app/auth/logout/route.js  ->  POST /auth/logout
// Forget the wristband on the server AND in the browser.

import { withApi, reply } from '../../../lib/api.js';
import { endSession } from '../../../lib/sessions.js';

async function logOut(call) {
  endSession(call);
  return reply(200, { loggedOut: true });
}

export const POST = withApi(logOut);
