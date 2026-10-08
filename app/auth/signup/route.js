// app/auth/signup/route.js  ->  POST /auth/signup
// Make a new account, then log in straight away.
//
// PASSWORD SAFETY: we never save the password itself. bcrypt turns it
// into a "hash", like putting fruit through a blender. You can always
// blend the same fruit again and compare smoothies, but you can never
// un-blend a smoothie back into fruit.
//
//   "sunflower42"  --bcrypt-->  "$2b$12$Vq0...Zk9e"   (this is what we store)

import bcrypt from 'bcrypt';
import { withApi, reply } from '../../../lib/api.js';
import { validateUsername, validatePassword } from '../../../lib/validation.js';
import { startSession } from '../../../lib/sessions.js';

async function signUp(call) {
  const username = validateUsername(call.body.username);
  if (!username.ok) {
    return reply(400, { error: username.error });
  }
  const password = validatePassword(call.body.password);
  if (!password.ok) {
    return reply(400, { error: password.error });
  }

  const { db, config } = call.context;
  const passwordHash = await bcrypt.hash(password.value, config.bcryptRounds);
  const user = db.createUser(username.value, passwordHash);
  if (!user) {
    // 409 means "Conflict": this clashes with something that already exists.
    return reply(409, { error: 'That username is already taken.' });
  }

  startSession(call, user.id);
  return reply(201, { user: { id: user.id, username: user.username } });
}

export const POST = withApi(signUp);
