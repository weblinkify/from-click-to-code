// app/(site)/page.js  ->  http://localhost:3000/
// The "front door" of our website. It runs on the server and sends
// finished HTML to the browser.
//
// <Link> is Next.js's version of an <a> link: it moves between pages
// without reloading the whole website.

import Link from 'next/link';
import ui from '../../lib/ui.js';

const STEPS = [
  { emoji: '🙋', title: 'Make an account', text: 'Pick a username and a password.' },
  { emoji: '✍️', title: 'Add your todos', text: 'Write down the things you want to do.' },
  { emoji: '✅', title: 'Tick them off', text: 'Feel great as your list gets shorter!' },
];

export default function HomePage() {
  return (
    <main className="space-y-10">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 px-6 py-12 text-white shadow-lg sm:px-12">
        <p className="text-sm font-bold uppercase tracking-widest text-blue-100">A real web app, for learning</p>
        <h1 className="mt-3 text-4xl font-extrabold leading-tight sm:text-5xl">📝 Kids Todo App</h1>
        <p className="mt-4 max-w-xl text-lg text-blue-50">
          Write down the things you want to do, then tick them off when you are done. And find out how
          every click works behind the scenes!
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/login" className="rounded-lg bg-white px-5 py-3 font-bold text-blue-700 shadow hover:bg-blue-50">
            Log in or sign up
          </Link>
          <Link href="/my-todos" className="rounded-lg border border-white/50 px-5 py-3 font-bold text-white hover:bg-white/10">
            Go to my todos
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {STEPS.map((step, index) => (
          <div key={step.title} className={ui.card}>
            <p className="text-3xl">{step.emoji}</p>
            <h2 className="mt-3 font-extrabold text-slate-900">
              {index + 1}. {step.title}
            </h2>
            <p className="mt-1 text-slate-600">{step.text}</p>
          </div>
        ))}
      </section>

      <section className="flex flex-col items-start gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-6 sm:flex-row sm:items-center">
        <p className="text-4xl">📚</p>
        <div className="flex-1">
          <h2 className="text-xl font-extrabold text-slate-900">How the Web Works: the course</h2>
          <p className="text-slate-700">
            23 short lessons and 6 hands-on labs, all using this very app. Learn about URLs, HTTPS, code
            review, security and more.
          </p>
        </div>
        <Link href="/course" className={ui.primaryButton}>
          Start learning →
        </Link>
      </section>
    </main>
  );
}
