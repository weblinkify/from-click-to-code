// app.js
// This file BUILDS the app: it connects all the pieces in order.
// It does not start listening; server.js does that. Keeping them apart
// lets our tests use the app without opening a real network port.
//
// A request travels down this list from top to bottom:
//
//   request --> read JSON body --> /todos routes --> not found --> error handler

const express = require('express');
const { createTodosRouter } = require('./routes/todos');
const { notFound, errorHandler } = require('./middleware/error-handler');

function createApp({ db }) {
  const app = express();

  // Turn the JSON text in a request into a JavaScript object (req.body).
  // The limit stops someone sending us a giant package.
  app.use(express.json({ limit: '10kb' }));

  app.use('/todos', createTodosRouter(db));

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
