// playwright.config.js
// Playwright is a robot that opens a real web browser and clicks around
// our app, exactly like a person would. These are "end-to-end" tests:
// they test everything at once, from the buttons to the database.

import { defineConfig, devices } from '@playwright/test';

const PORT = 3100;

export default defineConfig({
  testDir: './tests/e2e',
  // Stop forgetting "test.only" in CI.
  forbidOnly: Boolean(process.env.CI),
  // In CI, try a failing test once more before calling it broken.
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    // Keep a recording when a test fails, to see what went wrong.
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // Build the app and start it before the tests, with a fresh in-memory database.
  webServer: {
    command: `npm run build && npx next start --port ${PORT}`,
    url: `http://localhost:${PORT}/health`,
    timeout: 180 * 1000,
    reuseExistingServer: false,
    env: {
      DB_PATH: ':memory:',
      SESSION_SECRET: 'e2e-test-secret',
      BCRYPT_ROUNDS: '4',
      LOGIN_MAX_ATTEMPTS: '5',
    },
  },
});
