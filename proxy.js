// proxy.js
// Next.js runs this file BEFORE every page is built, like a guard at the gate.
// (In older versions of Next.js this file was called middleware.js.)
//
// Its job: send a Content-Security-Policy (CSP) with each page (plus
// Strict-Transport-Security when the site has HTTPS).
// The CSP tells the browser: "only run scripts that come from our site
// AND carry today's secret password". That password is called a "nonce"
// (a "number used once"). It's brand new for every visit, so a sneaky
// script someone slipped into the page can't know it, and won't run.

import { NextResponse } from 'next/server';
import { readConfig } from './lib/config.js';

function buildCsp(nonce, config) {
  const isDevelopment = process.env.NODE_ENV === 'development';

  const rules = [
    "default-src 'self'",
    // Scripts: only ours, only with the nonce. (In development, React also
    // needs 'unsafe-eval' to show helpful error messages.)
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDevelopment ? " 'unsafe-eval'" : ''}`,
    `style-src 'self' 'nonce-${nonce}'`,
    "img-src 'self' blob: data:",
    "font-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
  ];
  // Only ask the browser to switch to HTTPS when we really have HTTPS.
  // On plain http://localhost this would break the page.
  if (config.cookieSecure) {
    rules.push('upgrade-insecure-requests');
  }
  return rules.join('; ');
}

export function proxy(request) {
  const config = readConfig();
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const csp = buildCsp(nonce, config);

  // Tell Next.js the CSP (so it can put the nonce on its own scripts)...
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('Content-Security-Policy', csp);
  const response = NextResponse.next({ request: { headers: requestHeaders } });

  // ...and tell the browser.
  response.headers.set('Content-Security-Policy', csp);

  // Strict-Transport-Security says "always use HTTPS from now on".
  // It only makes sense once the site really has HTTPS.
  if (config.cookieSecure) {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  return response;
}

// Only pages need this. Skip the API routes (they answer with JSON, not
// pages), Next.js's own files, and "prefetches" (Next.js peeking ahead).
export const config = {
  matcher: [
    {
      source: '/((?!todos|auth/|health|metrics|_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
