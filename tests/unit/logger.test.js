import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createLogger } from '../../lib/logger.js';

describe('the logger', () => {
  it('writes one JSON line per message, with time and level', () => {
    const lines = [];
    const logger = createLogger({ write: (line) => lines.push(line) });

    logger.info('hello', { requestId: 'abc' });

    assert.equal(lines.length, 1);
    const entry = JSON.parse(lines[0]);
    assert.equal(entry.level, 'info');
    assert.equal(entry.message, 'hello');
    assert.equal(entry.requestId, 'abc');
    assert.ok(entry.time, 'it has a time stamp');
  });
});
