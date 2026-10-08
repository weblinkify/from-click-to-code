import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createMetrics } from '../../lib/metrics.js';

describe('the metrics counters', () => {
  it('start at zero', () => {
    const metrics = createMetrics();
    assert.equal(metrics.snapshot().todosCreated, 0);
  });

  it('go up by one each time something is counted', () => {
    const metrics = createMetrics();
    metrics.increment('todosCreated');
    metrics.increment('todosCreated');
    assert.equal(metrics.snapshot().todosCreated, 2);
  });

  it('refuse a counter name that does not exist (catches typos)', () => {
    const metrics = createMetrics();
    assert.throws(() => metrics.increment('todosCreatd'));
  });
});
