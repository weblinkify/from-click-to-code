// eslint.config.js
// ESLint is a "spell checker" for code. It spots mistakes like a variable
// we forgot to use, or one we used but never created.

const js = require('@eslint/js');

// Names that Node.js gives every backend file for free.
const nodeGlobals = {
  require: 'readonly',
  module: 'writable',
  process: 'readonly',
  console: 'readonly',
  __dirname: 'readonly',
  Buffer: 'readonly',
  setTimeout: 'readonly',
  clearTimeout: 'readonly',
};

// Names that the web browser gives frontend files for free.
const browserGlobals = {
  window: 'readonly',
  document: 'readonly',
  fetch: 'readonly',
  console: 'readonly',
};

module.exports = [
  {
    ignores: [
      'node_modules/',
      'data/',
      'test-results/',
      'playwright-report/',
      'bad-examples/',
    ],
  },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'commonjs',
      globals: nodeGlobals,
    },
  },
  {
    files: ['frontend/**/*.js'],
    languageOptions: {
      sourceType: 'script',
      globals: browserGlobals,
    },
  },
];
