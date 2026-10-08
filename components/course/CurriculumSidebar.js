'use client';
// components/course/CurriculumSidebar.js
// The "Course content" list down the side of the lesson player, like on
// Udemy or Coursera: every section, every lesson, with a tick ✓ next to
// the ones you've finished. The lesson you're on is highlighted.

import { useState } from 'react';
import Link from 'next/link';
import { SECTIONS, formatMinutes } from '../../lib/course/curriculum.js';

function LessonRow({ lesson, isCurrent, isDone }) {
  return (
    <li>
      <Link
        href={`/course/${lesson.slug}`}
        aria-current={isCurrent ? 'page' : undefined}
        className={`curriculum-lesson flex gap-3 border-l-4 px-4 py-3 text-sm transition ${
          isCurrent ? 'border-blue-600 bg-blue-50' : 'border-transparent hover:bg-slate-50'
        }`}
      >
        {/* The tick circle: green with ✓ when finished. */}
        <span
          className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 text-[0.7rem] font-black ${
            isDone ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 text-transparent'
          }`}
          aria-label={isDone ? 'finished' : 'not finished yet'}
        >
          ✓
        </span>
        <span className="grow">
          <span className={`block ${isCurrent ? 'font-bold text-slate-900' : 'text-slate-700'}`}>
            {lesson.number}. {lesson.title}
          </span>
          <span className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
            <span>{lesson.lab ? '🧪 Lab' : '📖 Reading'}</span>
            <span>·</span>
            <span>{lesson.minutes} min</span>
          </span>
        </span>
      </Link>
    </li>
  );
}

function SectionBlock({ section, sectionNumber, currentSlug, isFinished }) {
  // Sections start open if the lesson you're on is inside them.
  const containsCurrent = section.lessons.some((lesson) => lesson.slug === currentSlug);
  const [open, setOpen] = useState(containsCurrent || !currentSlug);
  const doneCount = section.lessons.filter((lesson) => isFinished(lesson.slug)).length;
  const minutes = section.lessons.reduce((total, lesson) => total + lesson.minutes, 0);

  return (
    <div className="border-b border-slate-200">
      <button
        type="button"
        className="flex w-full items-start justify-between gap-3 bg-slate-50 px-4 py-3 text-left hover:bg-slate-100"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <span>
          <span className="block font-bold text-slate-900">
            Section {sectionNumber}: {section.title}
          </span>
          <span className="text-xs text-slate-500">
            {doneCount} / {section.lessons.length} · {formatMinutes(minutes)}
          </span>
        </span>
        <span className={`mt-1 text-slate-500 transition ${open ? 'rotate-180' : ''}`} aria-hidden="true">
          ▾
        </span>
      </button>
      {open && (
        <ul>
          {section.lessons.map((lesson) => (
            <LessonRow
              key={lesson.slug}
              lesson={lesson}
              isCurrent={lesson.slug === currentSlug}
              isDone={isFinished(lesson.slug)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

export default function CurriculumSidebar({ currentSlug, isFinished }) {
  return (
    <nav aria-label="Course content">
      {SECTIONS.map((section, index) => (
        <SectionBlock
          key={section.title}
          section={section}
          sectionNumber={index + 1}
          currentSlug={currentSlug}
          isFinished={isFinished}
        />
      ))}
    </nav>
  );
}
