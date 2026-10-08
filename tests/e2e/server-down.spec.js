// Resilience: what happens when things go wrong?
// We pretend the server is down by making the browser's requests fail.

import { test, expect } from '@playwright/test';

// True for requests to our API (but not for the HTML/CSS/JS files).
function isApiRequest(url) {
  const path = url.pathname;
  return path.startsWith('/auth/') || path === '/todos' || path.startsWith('/todos/');
}

test('frontend shows a friendly message when the server is down', async ({ page }) => {
  // Every API request fails, as if the server were switched off.
  await page.route(isApiRequest, (route) => route.abort('connectionrefused'));

  await page.goto('/todos.html');

  await expect(page.getByRole('alert')).toContainText('The server is taking a nap');
});

test('the message appears if the server goes down while you are using the app', async ({ page }) => {
  await page.goto('/login.html');
  await page.getByLabel('Pick a username').fill('napper' + Date.now());
  await page.getByLabel('Pick a password').fill('sunflower-42');
  await page.getByRole('button', { name: 'Sign up' }).click();
  await expect(page).toHaveURL(/todos\.html/);

  // Now the server "goes down".
  await page.route(isApiRequest, (route) => route.abort('connectionrefused'));
  await page.getByPlaceholder('What do you want to do?').fill('Will this save?');
  await page.getByRole('button', { name: 'Add' }).click();

  await expect(page.getByRole('alert')).toContainText('The server is taking a nap');
  // The typed words are kept, so nothing is lost.
  await expect(page.getByPlaceholder('What do you want to do?')).toHaveValue('Will this save?');
});
