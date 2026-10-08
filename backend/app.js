// app.js
// This file BUILDS the app: it connects all the pieces in order.
// It does not start listening; server.js does that. Keeping them apart
// lets our tests use the app without opening a real network port.
//
// Every request travels down this list from top to bottom, like a
// letter going through the sorting machines at the post office:
//
//   request
//     |
//     v
//   security headers (helmet)  -> adds safety instructions to every answer
//   frontend files             -> HTML, CSS and JS for the browser
//   read JSON body             -> turns the request's JSON into req.body
//   read cookies               -> turns the Cookie header into req.cookies
//   load session               -> works out WHO is asking (req.user)
//   CSRF check                 -> blocks changes without the secret handshake
//   /auth routes               -> sign up, log in, log out
//   require login + /todos     -> only logged-in users get past here
//   not found / error handler  -> anything left over ends up here

const path = require('node:path');
const express = require('express');
const helmet = require('helmet');
const { readConfig } = require('./config');
const { createAuthRouter } = require('./routes/auth');
const { createTodosRouter } = require('./routes/todos');
const { readCookies } = require('./middleware/cookies');
const { loadSession } = require('./middleware/sessions');
const { csrfProtection } = require('./middleware/csrf');
const { requireLogin } = require('./middleware/require-login');
const { notFound, errorHandler } = require('./middleware/error-handler');

// The folder holding index.html, app.js and style.css.
const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');

// Security headers are extra instructions we send with every answer,
// telling the browser to be careful. For example:
//   Content-Security-Policy: only run scripts that come from OUR site
//   X-Frame-Options: don't let other sites show us inside a frame
//   X-Content-Type-Options: don't guess file types, trust what we say
function securityHeaders(config) {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        // Only ask the browser to switch to HTTPS when we really have HTTPS.
        // On plain http://localhost this would break the page.
        upgradeInsecureRequests: config.cookieSecure ? [] : null,
      },
    },
    // Strict-Transport-Security says "always use HTTPS from now on".
    // It only makes sense once the site really has HTTPS.
    strictTransportSecurity: config.cookieSecure,
  });
}

function createApp({ db, config = readConfig() }) {
  const app = express();

  // Behind a cloud "front desk" server, trust it to tell us the visitor's
  // real address (needed so rate limiting counts each visitor separately).
  app.set('trust proxy', config.trustProxy);

  app.use(securityHeaders(config));

  // Send the frontend files (HTML, CSS, JS) to the browser as they are.
  // Visiting "/" gives you index.html.
  app.use(express.static(FRONTEND_DIR));

  // Turn the JSON text in a request into a JavaScript object (req.body).
  // The limit stops someone sending us a giant package.
  app.use(express.json({ limit: '10kb' }));

  app.use(readCookies);
  app.use(loadSession(db));
  app.use(csrfProtection(config));

  app.use('/auth', createAuthRouter(db, config));
  app.use('/todos', requireLogin, createTodosRouter(db));

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
