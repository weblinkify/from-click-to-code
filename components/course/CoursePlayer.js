'use client';
// components/course/CoursePlayer.js
// The lesson player, laid out like Udemy or Coursera:
//
//   ┌──────────────────── dark top bar: course title + progress ───────────────────┐
//   ├────────────────────────────────────────────────────┬─────────────────────────┤
//   │  Section 2 · Lesson 5                              │  Course content         │
//   │  The parts of a URL 🔗                             │  ▾ Section 1 ...        │
//   │  [ 🧪 Lab ] [ 📖 Reading ]   <- tabs                │    ✓ 1. The idea        │
//   │                                                    │    ✓ 2. Requirements    │
//   │  ... the lesson ...                                │  ▾ Section 2 ...        │
//   │                                                    │    ▸ 5. URLs  (you)     │
//   │  [← Previous]          [Mark complete & continue →]│                         │
//   └────────────────────────────────────────────────────┴─────────────────────────┘
//
// The page (app/(player)/course/[slug]/page.js) hands us the lesson's
// lab and reading, already built.

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CurriculumSidebar from './CurriculumSidebar.js';
import ProgressBar from './ProgressBar.js';
import { COURSE, LESSONS, findLesson, neighbours } from '../../lib/course/curriculum.js';
import { useProgress } from '../../lib/course/progress.js';
import ui from '../../lib/ui.js';

function Tabs({ tab, setTab }) {
  const tabs = [
    { id: 'lab', label: '🧪 Hands-on lab' },
    { id: 'reading', label: '📖 Reading' },
  ];
  return (
    <div className="mb-6 flex gap-1 border-b border-slate-200" role="tablist">
      {tabs.map((item) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={tab === item.id}
          className={`-mb-px border-b-4 px-4 py-2.5 font-bold transition ${
            tab === item.id ? 'border-blue-600 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
          onClick={() => setTab(item.id)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

export default function CoursePlayer({ slug, lab, reading }) {
  const router = useRouter();
  const lesson = findLesson(slug);
  const { previous, next } = neighbours(slug);
  const { finished, isFinished, setFinished } = useProgress();
  // Hands-on lessons open on the lab; you can switch to the reading.
  const [tab, setTab] = useState(lab ? 'lab' : 'reading');
  // On small screens, the course content list opens like a drawer.
  const [showContents, setShowContents] = useState(false);

  const done = isFinished(slug);

  function completeAndContinue() {
    setFinished(slug, true);
    if (next) {
      router.push(`/course/${next.slug}`);
    } else {
      router.push('/course?finished=1');
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* ---------- the dark top bar ---------- */}
      <header className="sticky top-0 z-30 bg-slate-900 text-white">
        <div className="flex items-center gap-4 px-4 py-3">
          <Link href="/course" className="flex shrink-0 items-center gap-2 font-extrabold hover:text-blue-200">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-600">📝</span>
            <span className="hidden sm:inline">Kids Todo</span>
          </Link>
          <span className="hidden h-6 w-px bg-slate-700 md:block" />
          <p className="hidden truncate font-semibold text-slate-200 md:block">{COURSE.title}</p>
          <div className="ml-auto w-40 sm:w-56">
            <ProgressBar done={finished.length} total={LESSONS.length} dark />
          </div>
          <button
            type="button"
            className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm font-bold lg:hidden"
            aria-expanded={showContents}
            onClick={() => setShowContents(!showContents)}
          >
            ☰ Contents
          </button>
        </div>
      </header>

      <div className="flex grow">
        {/* ---------- the lesson ---------- */}
        <main className="min-w-0 grow">
          <div className="mx-auto max-w-3xl px-4 py-8 sm:px-8">
            <p className="text-sm font-bold uppercase tracking-wider text-blue-700">
              Section {lesson.sectionNumber} · Lesson {lesson.number}
            </p>
            <h1 className="mt-2 text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl">
              {lesson.title} {lesson.emoji}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              {lesson.lab ? '🧪 Hands-on lab + reading' : '📖 Reading'} · about {lesson.minutes} minutes
              {done && <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 font-bold text-emerald-700">✓ Completed</span>}
            </p>

            <div className="mt-8">
              {lab && <Tabs tab={tab} setTab={setTab} />}
              {/* Both stay on the page (just hidden), so a lab keeps its state. */}
              {lab && (
                <div className="space-y-3" hidden={tab !== 'lab'}>
                  {lab}
                </div>
              )}
              <div hidden={tab !== 'reading'}>{reading}</div>
            </div>

            {/* ---------- bottom navigation ---------- */}
            <div className="mt-12 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
              {previous ? (
                <Link href={`/course/${previous.slug}`} className={ui.secondaryButton}>
                  ← {previous.number}. {previous.title}
                </Link>
              ) : (
                <Link href="/course" className={ui.secondaryButton}>
                  ← Course home
                </Link>
              )}
              <button type="button" className={ui.primaryButton} onClick={completeAndContinue}>
                {next ? 'Mark complete & continue →' : 'Finish the course 🎉'}
              </button>
            </div>
            {done && (
              <p className="mt-3 text-right">
                <button type="button" className="text-sm text-slate-500 underline" onClick={() => setFinished(slug, false)}>
                  Mark as not finished
                </button>
              </p>
            )}
          </div>
        </main>

        {/* ---------- the course content sidebar ---------- */}
        <aside
          className={`${
            showContents ? 'fixed inset-0 top-14 z-20 block' : 'hidden'
          } w-full overflow-y-auto border-l border-slate-200 bg-white lg:sticky lg:top-14 lg:block lg:h-[calc(100vh-3.5rem)] lg:w-96 lg:shrink-0`}
        >
          <h2 className="border-b border-slate-200 px-4 py-4 text-lg font-extrabold text-slate-900">Course content</h2>
          <CurriculumSidebar currentSlug={slug} isFinished={isFinished} />
        </aside>
      </div>
    </div>
  );
}
