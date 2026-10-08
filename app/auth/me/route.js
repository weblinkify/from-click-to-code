// app/auth/me/route.js  ->  GET /auth/me
// "Who am I logged in as?"

import { withApi, reply } from '../../../lib/api.js';

async function whoAmI(call) {
  if (!call.user) {
    return reply(401, { error: 'Not logged in.' });
  }
  return reply(200, { user: { id: call.user.id, username: call.user.username } });
}

export const GET = withApi(whoAmI);
