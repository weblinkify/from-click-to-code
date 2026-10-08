// The in-app course: every lesson's experiments, driven by a robot browser.

import { test, expect } from '@playwright/test';

// Sign up a brand-new kid, so experiments that need a login work.
async function signUp(page) {
  await page.goto('/login');
  await page.getByLabel('Pick a username').fill('learner' + Date.now() + Math.floor(Math.random() * 1000));
  await page.getByLabel('Pick a password').fill('sunflower-42');
  await page.getByRole('button', { name: 'Sign up' }).click();
  await expect(page).toHaveURL(/my-todos/);
}

test('the course home lists all six lessons', async ({ page }) => {
  await page.goto('/course');
  await expect(page.locator('.lesson-link')).toHaveCount(6);
});

test('URL lesson: takes a URL apart and asks the real app', async ({ page }) => {
  await signUp(page);
  await page.goto('/course/url');
  await page.getByLabel('A web address').fill('http://localhost:3000/todos?completed=true#top');
  await expect(page.getByTestId('url-colored').locator('.part-path')).toHaveText('/todos');
  await expect(page.getByTestId('url-colored').locator('.part-query')).toHaveText('?completed=true');

  await page.getByRole('button', { name: '/todos?completed=banana' }).click();
  await expect(page.locator('.status-code')).toHaveText('400');

  await page.getByRole('button', { name: 'Add #treasure to the address' }).click();
  await expect(page.getByTestId('here-fragment')).toHaveText('#treasure');
});

test('HTTPS lesson: real encryption, and the wristband cookie is hidden', async ({ page }) => {
  await signUp(page);
  await page.goto('/course/https');

  const envelope = page.getByTestId('envelope-text');
  await expect(envelope).not.toHaveText('');
  await expect(envelope).not.toContainText('sunflower42');
  await page.getByRole('button', { name: /Unlock/ }).click();
  await expect(page.getByTestId('unlocked-text')).toContainText('my password is sunflower42');

  await page.getByRole('button', { name: 'Look for cookies' }).click();
  await expect(page.getByTestId('who-am-i')).toContainText('Yes!');
  await expect(page.getByTestId('visible-cookies')).not.toContainText('sid');
});

test('API lesson: the request builder adds a todo', async ({ page }) => {
  await signUp(page);
  await page.goto('/course/api');
  await page.getByRole('button', { name: '➕ Add a todo' }).click();
  await page.getByRole('button', { name: 'Send' }).click();
  await expect(page.locator('.status-code')).toHaveText('201');
});

test('code review game: spotting the bug scores a point', async ({ page }) => {
  await page.goto('/course/code-review');
  // Round 1 is the SQL injection; line 3 glues the user's words into SQL.
  await page.getByRole('button', { name: /^Line 3:/ }).click();
  await expect(page.getByText('🎉 You spotted it!')).toBeVisible();
  await expect(page.getByText('Score: 1')).toBeVisible();
  await page.getByRole('button', { name: 'Next round →' }).click();
  await expect(page.getByRole('heading', { name: /Round 2 of 6/ })).toBeVisible();
});

test('security lab: every trick is blocked', async ({ page }) => {
  page.on('dialog', () => {
    throw new Error('A pop-up appeared: the XSS trick worked!');
  });
  await signUp(page);
  await page.goto('/course/security');

  for (const name of ['Trick 1', 'Trick 2', 'Trick 3', 'Trick 4']) {
    const box = page.locator('.experiment', { has: page.getByRole('heading', { name: new RegExp(name) }) });
    await box.getByRole('button', { name: 'Try the trick' }).click();
    await expect(box.locator('.lab-result.is-blocked'), name).toBeVisible();
  }

  await page.getByRole('button', { name: /Start the robot/ }).click();
  await expect(page.getByText('🚦 Too many tries, wait!').first()).toBeVisible();
});

test('incident room: the live dashboard shows the app is healthy', async ({ page }) => {
  await page.goto('/course/incident');
  await expect(page.getByTestId('health-words')).toContainText('Healthy');
  await expect(page.locator('.history-dot').first()).toBeVisible();
});
