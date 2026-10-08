// eslint.config.js
// ESLint is a "spell checker" for code. It spots mistakes like a variable
// we forgot to use, or one we used but never created.

import js from '@eslint/js';

// Names that Node.js gives server files for free.
const nodeGlobals = {
  process: 'readonly',
  console: 'readonly',
  Buffer: 'readonly',
  URL: 'readonly',
  Headers: 'readonly',
  Request: 'readonly',
  Response: 'readonly',
  setTimeout: 'readonly',
  clearTimeout: 'readonly',
  setInterval: 'readonly',
  clearInterval: 'readonly',
  structuredClone: 'readonly',
};

// Names that the web browser gives frontend files for free.
const browserGlobals = {
  window: 'readonly',
  document: 'readonly',
  fetch: 'readonly',
  console: 'readonly',
  URL: 'readonly',
  URLSearchParams: 'readonly',
  Headers: 'readonly',
  TextEncoder: 'readonly',
  TextDecoder: 'readonly',
  CustomEvent: 'readonly',
  setTimeout: 'readonly',
  clearTimeout: 'readonly',
  setInterval: 'readonly',
  clearInterval: 'readonly',
};

export default [
  {
    ignores: [
      'node_modules/',
      '.next/',
      'data/',
      'test-results/',
      'playwright-report/',
      'bad-examples/',
      'next-env.d.ts',
    ],
  },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      // JSX is the HTML-looking code inside React components.
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...nodeGlobals, ...browserGlobals },
    },
  },
];
