// metrics.js
// "Metrics" are numbers that tell us how the app is doing, like the
// dashboard in a car: speed, fuel, temperature.
//
// We keep simple counters that only go up. GET /metrics shows them.
// If "errorsTotal" suddenly jumps, something is wrong!
//
// (They live in memory, so they start again from 0 when the app restarts.)

const COUNTER_NAMES = ['requestsTotal', 'errorsTotal', 'todosCreated', 'loginsFailed'];

function createMetrics() {
  const startedAt = Date.now();
  const counters = {};
  for (const name of COUNTER_NAMES) {
    counters[name] = 0;
  }

  function increment(name) {
    if (!(name in counters)) {
      throw new Error(`Unknown metric: ${name}`);
    }
    counters[name] = counters[name] + 1;
  }

  function snapshot() {
    return {
      ...counters,
      uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
    };
  }

  return { increment, snapshot };
}

module.exports = { createMetrics };
