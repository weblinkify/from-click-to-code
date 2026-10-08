// app/layout.js
// The "frame" around EVERY page: the <html> and <body> tags, the styles,
// and the "server is taking a nap" banner.
//
// In Next.js, components run on the SERVER unless they say "use client".
// This layout runs on the server; the banner inside it runs in the browser.

import { headers } from 'next/headers';
import ServerDownBanner from '../components/ServerDownBanner.js';
import './globals.css';

export const metadata = {
  title: { default: 'Kids Todo App', template: '%s · Kids Todo App' },
  description: 'A small, real web app for learning how websites work.',
};

export default async function RootLayout({ children }) {
  // Reading the request headers makes Next.js build each page fresh for
  // every visit. That's needed for our Content-Security-Policy: proxy.js
  // makes a new secret "nonce" for each visit (see proxy.js).
  await headers();

  return (
    <html lang="en">
      <body className="min-h-screen">
        <ServerDownBanner />
        {children}
      </body>
    </html>
  );
}
