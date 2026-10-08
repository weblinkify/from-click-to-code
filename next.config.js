// next.config.js
// Settings for Next.js, the framework our app is built with.

// Extra safety instructions sent with EVERY answer (pages and API).
// (The Content-Security-Policy is set per request in proxy.js.)
//   X-Frame-Options: don't let other sites show us inside a frame
//   X-Content-Type-Options: don't guess file types, trust what we say
//   Referrer-Policy: don't tell other sites which page you came from
//   Cross-Origin-Opener-Policy: keep our page separate from other sites' pages
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'no-referrer' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
];

// Strict-Transport-Security says "always use HTTPS from now on".
// It only makes sense once the site really has HTTPS.
if (process.env.COOKIE_SECURE === 'true') {
  securityHeaders.push({ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' });
}

const nextConfig = {
  // Build a small, self-contained server for Docker (see Dockerfile).
  output: 'standalone',
  // Don't announce "X-Powered-By: Next.js": no need to tell attackers.
  poweredByHeader: false,
  // Make sure schema.sql is packed into the standalone server.
  outputFileTracingIncludes: {
    '/**': ['./lib/db/schema.sql'],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
