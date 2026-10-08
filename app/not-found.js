// app/not-found.js
// Shown when someone visits a page that doesn't exist (a 404).

import Link from 'next/link';
import ui from '../lib/ui.js';

export default function NotFound() {
  return (
    <main className="mx-auto mt-24 max-w-md px-4 text-center">
      <p className="text-6xl">🧭</p>
      <h1 className="mt-4 text-3xl font-extrabold text-slate-900">Page not found</h1>
      <p className="mt-2 text-slate-600">There&apos;s nothing at this address. Maybe there&apos;s a typo in the URL?</p>
      <Link href="/" className={`${ui.primaryButton} mt-6`}>
        Go back home
      </Link>
    </main>
  );
}
