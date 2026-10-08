// app/not-found.js
// Shown when someone visits a page that doesn't exist (a 404).

import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="card">
      <h1>🧭 Page not found</h1>
      <p>There&apos;s nothing at this address. Maybe there&apos;s a typo in the URL?</p>
      <p>
        <Link href="/">Go back home</Link>
      </p>
    </main>
  );
}
