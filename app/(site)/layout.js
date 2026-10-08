// app/(site)/layout.js
// The folder name "(site)" has round brackets, so Next.js leaves it OUT
// of the web address. It's just a way to group the normal pages (home,
// login, my todos, course home) so they all share this header and footer.
// The lesson player lives in the "(player)" group with its own layout.

import SiteHeader from '../../components/SiteHeader.js';

export default function SiteLayout({ children }) {
  return (
    <>
      <SiteHeader />
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-12">{children}</div>
      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-500">
        Made for learning. Every page is real code you can read. 💙
      </footer>
    </>
  );
}
