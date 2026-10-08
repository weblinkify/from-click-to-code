// Security headers, checked on the real running app.

import { test, expect } from '@playwright/test';

test('pages carry a Content-Security-Policy with a fresh nonce each visit', async ({ request }) => {
  const first = await request.get('/');
  const second = await request.get('/');
  const firstCsp = first.headers()['content-security-policy'];
  const secondCsp = second.headers()['content-security-policy'];

  expect(firstCsp).toContain("script-src 'self' 'nonce-");
  expect(firstCsp).toContain("object-src 'none'");
  // A brand-new secret "nonce" for every visit.
  expect(firstCsp).not.toEqual(secondCsp);
});

test('every answer has the other safety headers', async ({ request }) => {
  for (const path of ['/', '/login', '/health']) {
    const headers = (await request.get(path)).headers();
    expect(headers['x-frame-options'], path).toBe('SAMEORIGIN');
    expect(headers['x-content-type-options'], path).toBe('nosniff');
    expect(headers['referrer-policy'], path).toBe('no-referrer');
    expect(headers['x-powered-by'], `${path} should not brag about Next.js`).toBeUndefined();
  }
});

test('API answers carry a request ID', async ({ request }) => {
  const res = await request.get('/health');
  expect(res.headers()['x-request-id']).toMatch(/^[0-9a-f-]{36}$/);
});

test('a page that does not exist shows a friendly 404', async ({ page }) => {
  const res = await page.goto('/no-such-page');
  expect(res.status()).toBe(404);
  await expect(page.getByRole('heading', { name: /Page not found/ })).toBeVisible();
});

test('the pages run without any CSP errors in the console', async ({ page }) => {
  const problems = [];
  page.on('console', (message) => {
    if (message.type() === 'error') {
      problems.push(message.text());
    }
  });
  for (const path of ['/', '/login', '/course']) {
    await page.goto(path);
    // Give the page a moment to start up its JavaScript.
    await page.waitForTimeout(500);
  }
  expect(problems).toEqual([]);
});
