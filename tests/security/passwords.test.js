// Passwords must never be stored as plain text.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { makeTestApp, signUp, TEST_PASSWORD } from '../helpers/test-app.js';

describe('storing passwords', () => {
  it('the database keeps a bcrypt hash, never the real password', async () => {
    const { db } = makeTestApp();
    await signUp('sam');

    const user = db.findUserByUsername('sam');
    assert.notEqual(user.passwordHash, TEST_PASSWORD);
    assert.equal(user.passwordHash.includes(TEST_PASSWORD), false);
    // bcrypt hashes start like "$2b$".
    assert.match(user.passwordHash, /^\$2[aby]\$/);
  });

  it('two people with the same password get different hashes (salt)', async () => {
    const { db } = makeTestApp();
    await signUp('sam');
    await signUp('alex');

    const sam = db.findUserByUsername('sam');
    const alex = db.findUserByUsername('alex');
    assert.notEqual(sam.passwordHash, alex.passwordHash);
  });
});
