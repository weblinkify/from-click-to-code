// app/page.js
// The "front door" of our website. Visiting http://localhost:3000/ shows this.
// It runs on the server and sends finished HTML to the browser.
//
// <Link> is Next.js's version of an <a> link: it moves between pages
// without reloading the whole website.

import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="card">
      <h1>📝 Kids Todo App</h1>
      <p className="lead">Write down the things you want to do, then tick them off when you are done!</p>

      <ul className="steps">
        <li>1. Make an account</li>
        <li>2. Add your todos</li>
        <li>3. Tick them off ✅</li>
      </ul>

      <p className="actions">
        <Link className="button" href="/login">
          Log in or sign up
        </Link>
        <Link className="button secondary" href="/my-todos">
          Go to my todos
        </Link>
      </p>

      <p>
        <Link href="/course">📚 Learn how websites work: try the interactive lessons</Link>
      </p>
    </main>
  );
}
