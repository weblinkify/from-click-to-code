'use client';
// app/(site)/course/page.js  ->  http://localhost:3000/course
// The course's landing page, like on Udemy or Coursera: a big banner,
// what you'll learn, the full list of lessons, and your progress.

import { useState } from 'react';
import Link from 'next/link';
import { COURSE, SECTIONS, LESSONS, TOTAL_MINUTES, LAB_COUNT, formatMinutes } from '../../../lib/course/curriculum.js';
import { useProgress } from '../../../lib/course/progress.js';
import ProgressBar from '../../../components/course/ProgressBar.js';
import ui from '../../../lib/ui.js';

const YOU_WILL_LEARN = [
  'What really happens when you click a link',
  'How to read every part of a URL',
  'Why HTTPS keeps your secrets safe (with real encryption!)',
  'How passwords, cookies and logins work',
  'How the frontend talks to the backend through an API',
  'How to spot bugs in a code review',
  'How apps defend against sneaky tricks',
  'How teams test, ship and fix real apps',
];

const INCLUDES = [
  `📖 ${LESSONS.length} short lessons`,
  `🧪 ${LAB_COUNT} hands-on labs using the real app`,
  `⏱️ About ${formatMinutes(TOTAL_MINUTES)} in total`,
  '🧠 Quizzes with answers to check yourself',
  '🕵️ A "spot the bug" code review game',
  '🚨 A live incident control room',
];

// One section of the curriculum, which opens and closes like an accordion.
function SectionAccordion({ section, sectionNumber, isFinished, startOpen }) {
  const [open, setOpen] = useState(startOpen);
  const minutes = section.lessons.reduce((total, lesson) => total + lesson.minutes, 0);

  return (
    <div className="border-b border-slate-200 last:border-b-0">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 bg-slate-50 px-5 py-4 text-left hover:bg-slate-100"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <span className="flex items-center gap-3">
          <span className={`text-slate-500 transition ${open ? 'rotate-180' : ''}`} aria-hidden="true">
            ▾
          </span>
          <span className="font-bold text-slate-900">
            Section {sectionNumber}: {section.title}
          </span>
        </span>
        <span className="shrink-0 text-sm text-slate-500">
          {section.lessons.length} lessons · {formatMinutes(minutes)}
        </span>
      </button>
      {open && (
        <ul className="divide-y divide-slate-100">
          {section.lessons.map((lesson) => (
            <li key={lesson.slug}>
              <Link
                href={`/course/${lesson.slug}`}
                className="course-lesson-link flex items-center gap-3 px-5 py-3 hover:bg-blue-50"
              >
                <span className="text-lg" aria-hidden="true">
                  {isFinished(lesson.slug) ? '✅' : lesson.emoji}
                </span>
                <span className="grow text-slate-700">
                  {lesson.number}. {lesson.title}
                </span>
                {lesson.lab && (
                  <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-bold text-violet-700">🧪 Lab</span>
                )}
                <span className="w-14 shrink-0 text-right text-sm text-slate-500">{lesson.minutes} min</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function CourseLandingPage() {
  const { finished, isFinished } = useProgress();
  // The first lesson you haven't finished yet: where "Continue" takes you.
  const nextUp = LESSONS.find((lesson) => !isFinished(lesson.slug)) || LESSONS[0];
  const hasStarted = finished.length > 0;
  const allDone = finished.length === LESSONS.length;

  return (
    <main>
      {/* ---------- the big banner ---------- */}
      <section className="-mx-4 -mt-8 bg-slate-900 px-4 py-12 text-white sm:-mt-12 sm:rounded-b-3xl sm:px-10">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-widest text-blue-300">Kids Todo Academy</p>
          <h1 className="mt-3 text-3xl font-extrabold leading-tight sm:text-5xl">{COURSE.title}</h1>
          <p className="mt-4 text-lg text-slate-300">{COURSE.subtitle}</p>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-300">
            <span>⭐ {COURSE.audience}</span>
            <span>📖 {LESSONS.length} lessons</span>
            <span>🧪 {LAB_COUNT} labs</span>
            <span>⏱️ {formatMinutes(TOTAL_MINUTES)}</span>
          </div>
        </div>
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-8">
          {allDone && (
            <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-6 text-center">
              <p className="text-4xl">🎓</p>
              <h2 className="mt-2 text-2xl font-extrabold text-emerald-800">You finished the whole course!</h2>
              <p className="text-emerald-900">Now teach someone else what you learned. That&apos;s the best test of all.</p>
            </div>
          )}

          {/* ---------- what you'll learn ---------- */}
          <section className={ui.card}>
            <h2 className="text-2xl font-extrabold text-slate-900">What you&apos;ll learn</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {YOU_WILL_LEARN.map((item) => (
                <li key={item} className="flex gap-2 text-slate-700">
                  <span className="font-bold text-emerald-600">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* ---------- the curriculum ---------- */}
          <section>
            <h2 className="text-2xl font-extrabold text-slate-900">Course content</h2>
            <p className="mt-1 text-sm text-slate-500">
              {SECTIONS.length} sections · {LESSONS.length} lessons · {formatMinutes(TOTAL_MINUTES)} total
            </p>
            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
              {SECTIONS.map((section, index) => (
                <SectionAccordion
                  key={section.title}
                  section={section}
                  sectionNumber={index + 1}
                  isFinished={isFinished}
                  startOpen={index === 0}
                />
              ))}
            </div>
          </section>

          {/* ---------- requirements ---------- */}
          <section className={ui.card}>
            <h2 className="text-2xl font-extrabold text-slate-900">Before you start</h2>
            <ul className="mt-3 list-disc space-y-1 pl-6 text-slate-700">
              <li>A computer with this app running (a grown-up can follow the README).</li>
              <li>A grown-up to explore with: it&apos;s more fun together!</li>
              <li>
                <Link href="/login" className={ui.link}>
                  An account in the app
                </Link>
                : some labs use your own todo list.
              </li>
              <li>No coding experience needed. Every new word is explained.</li>
            </ul>
          </section>
        </div>

        {/* ---------- the sticky side card ---------- */}
        <aside>
          <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg lg:sticky lg:top-24">
            <ProgressBar done={finished.length} total={LESSONS.length} />
            <Link href={`/course/${nextUp.slug}`} className={`${ui.primaryButton} w-full`}>
              {hasStarted ? `Continue: ${nextUp.number}. ${nextUp.title} →` : 'Start learning →'}
            </Link>
            <div>
              <h3 className="font-extrabold text-slate-900">This course includes</h3>
              <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
                {INCLUDES.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <p className="text-xs text-slate-500">Your progress is saved in this browser only. Nobody else can see it.</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
