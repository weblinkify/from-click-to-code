'use client';
// components/SiteHeader.js
// The bar across the top of the normal pages: the logo and the menu.
// usePathname() tells us which page we're on, so we can underline it.

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const MENU = [
  { href: '/course', label: '📚 Learn' },
  { href: '/my-todos', label: '✅ My todos' },
];

export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3 sm:gap-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-extrabold text-slate-900">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-white">📝</span>
          <span className="hidden sm:inline">Kids Todo</span>
        </Link>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          {MENU.map((item) => {
            const isHere = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isHere ? 'page' : undefined}
                className={
                  isHere
                    ? 'rounded-lg bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700'
                    : 'rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/login"
            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-bold text-white hover:bg-slate-700"
          >
            Log in
          </Link>
        </div>
      </nav>
    </header>
  );
}
