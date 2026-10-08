// The "happy path": the main journey a real person takes through the app.
// sign up -> log in -> add todo -> complete -> delete

import { test, expect } from '@playwright/test';

// Every run gets a new username, so tests never bump into each other.
function newUsername() {
  return 'kid' + Date.now() + Math.floor(Math.random() * 1000);
}

const PASSWORD = 'sunflower-42';

async function signUp(page, username) {
  await page.goto('/login.html');
  await page.getByLabel('Pick a username').fill(username);
  await page.getByLabel('Pick a password').fill(PASSWORD);
  await page.getByRole('button', { name: 'Sign up' }).click();
  await expect(page).toHaveURL(/todos\.html/);
}

test('a kid can sign up, log in, add a todo, complete it and delete it', async ({ page }) => {
  const username = newUsername();

  // 1. Sign up (this also logs us in), then log out.
  await signUp(page, username);
  await expect(page.getByText(`Hi, ${username}!`)).toBeVisible();
  await page.getByRole('button', { name: 'Log out' }).click();
  await expect(page).toHaveURL(/login\.html/);

  // 2. Log in again with the same username and password.
  await page.getByLabel('Username', { exact: true }).fill(username);
  await page.getByLabel('Password', { exact: true }).fill(PASSWORD);
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page).toHaveURL(/todos\.html/);

  // 3. Add a todo.
  await page.getByPlaceholder('What do you want to do?').fill('Feed the cat');
  await page.getByRole('button', { name: 'Add' }).click();
  const item = page.locator('.todo-item', { hasText: 'Feed the cat' });
  await expect(item).toBeVisible();

  // 4. Tick it off.
  await item.getByRole('checkbox').check();
  await expect(item).toHaveClass(/is-done/);

  // 5. Delete it.
  await item.getByRole('button', { name: 'Delete' }).click();
  await expect(item).toHaveCount(0);
  await expect(page.getByText('Nothing here yet')).toBeVisible();
});

test('the todos page sends logged-out visitors to the login page', async ({ page }) => {
  await page.goto('/todos.html');
  await expect(page).toHaveURL(/login\.html/);
});

test('a wrong password shows a friendly message', async ({ page }) => {
  await page.goto('/login.html');
  await page.getByLabel('Username', { exact: true }).fill('nobody-here');
  await page.getByLabel('Password', { exact: true }).fill('not-the-password');
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page.getByText('Wrong username or password.')).toBeVisible();
});

test('todo text with <script> is shown as text, not run', async ({ page }) => {
  const scriptText = '<script>window.hacked = true</script>';
  // If any pop-up appears, the test fails.
  page.on('dialog', () => {
    throw new Error('A script ran! That should never happen.');
  });

  await signUp(page, newUsername());
  await page.getByPlaceholder('What do you want to do?').fill(scriptText);
  await page.getByRole('button', { name: 'Add' }).click();

  // The exact letters are on the screen...
  await expect(page.locator('.todo-text')).toHaveText(scriptText);
  // ...and the code inside them never ran.
  expect(await page.evaluate(() => window.hacked)).toBeUndefined();
});
