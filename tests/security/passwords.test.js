// Passwords must never be stored as plain text.

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { makeTestApp, signUp, TEST_PASSWORD } = require('../helpers/test-app');

describe('storing passwords', () => {
  it('the database keeps a bcrypt hash, never the real password', async () => {
    const { app, db } = makeTestApp();
    await signUp(app, 'sam');

    const user = db.findUserByUsername('sam');
    assert.notEqual(user.passwordHash, TEST_PASSWORD);
    assert.equal(user.passwordHash.includes(TEST_PASSWORD), false);
    // bcrypt hashes start like "$2b$".
    assert.match(user.passwordHash, /^\$2[aby]\$/);
  });

  it('two people with the same password get different hashes (salt)', async () => {
    const { app, db } = makeTestApp();
    await signUp(app, 'sam');
    await signUp(app, 'alex');

    const sam = db.findUserByUsername('sam');
    const alex = db.findUserByUsername('alex');
    assert.notEqual(sam.passwordHash, alex.passwordHash);
  });
});
