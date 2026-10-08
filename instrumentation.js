// instrumentation.js
// Next.js runs register() ONCE, when the server starts up, before any
// visitor arrives. We use it to open the database and write the first
// lines in the logs (the app's diary), like unlocking the shop in the
// morning before the first customer walks in.

export async function register() {
  // This file can also run in other places; we only want the real server.
  if (process.env.NEXT_RUNTIME !== 'nodejs') {
    return;
  }
  const { getContext } = await import('./lib/context.js');
  const context = getContext();
  context.logger.info('server started', {
    port: process.env.PORT || 3000,
    environment: context.config.isProduction ? 'production' : 'development',
  });
}
