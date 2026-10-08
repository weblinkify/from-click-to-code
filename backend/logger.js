// logger.js
// A "log" is the app's diary. Every time something happens, we write
// one line about it. When something breaks, we read the diary to find out why.
//
// We write each line as JSON (a structured format), not as a sentence:
//
//   {"time":"2026-10-08T09:30:00.000Z","level":"info","message":"request finished",
//    "requestId":"4f1c...","method":"GET","path":"/todos","status":200,"ms":3}
//
// Computers can search JSON easily, e.g. "show me every line where status is 500".

const LEVELS = ['info', 'warn', 'error'];

// write is where the lines go. Normally that's the terminal (stdout),
// but tests pass their own write function to catch the lines.
function createLogger({ write = (line) => process.stdout.write(line + '\n') } = {}) {
  function log(level, message, details = {}) {
    if (!LEVELS.includes(level)) {
      throw new Error(`Unknown log level: ${level}`);
    }
    const entry = {
      time: new Date().toISOString(),
      level,
      message,
      ...details,
    };
    write(JSON.stringify(entry));
  }

  return {
    info: (message, details) => log('info', message, details),
    warn: (message, details) => log('warn', message, details),
    error: (message, details) => log('error', message, details),
  };
}

module.exports = { createLogger };
