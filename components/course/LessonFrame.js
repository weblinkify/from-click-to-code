'use client';
// components/course/LessonFrame.js
// The frame around every lesson page: the title at the top, and at the
// bottom a "finished!" button, a link to the full written lesson, and
// links to the previous and next lessons.

import { useState } from 'react';
import Link from 'next/link';
import { findLesson, nextLesson, previousLesson, codeLink } from '../../lib/course/lessons.js';
import { markFinished } from '../../lib/course/progress.js';

export default function LessonFrame({ lessonId, children }) {
  const lesson = findLesson(lessonId);
  const next = nextLesson(lessonId);
  const previous = previousLesson(lessonId);
  const [finished, setFinished] = useState(false);

  function finishLesson() {
    markFinished(lessonId);
    setFinished(true);
  }

  return (
    <main className="card course">
      <p>
        <Link href="/course">← All lessons</Link>
      </p>
      <p className="kicker">Lesson {lesson.number}</p>
      <h1>
        {lesson.title} {lesson.emoji}
      </h1>

      {children}

      <section className="experiment finish">
        <button type="button" onClick={finishLesson}>
          ✅ I finished this lesson
        </button>
        {finished && <p className="message is-good">Brilliant! A star ⭐ is waiting on the course page.</p>}
        <p className="muted">
          Want the whole story, with more questions?{' '}
          <a href={codeLink(lesson.markdown)} target="_blank" rel="noopener noreferrer">
            📖 Read the full lesson
          </a>
        </p>
      </section>

      <nav className="lesson-nav">
        {previous ? <Link href={`/course/${previous.id}`}>← {previous.title}</Link> : <Link href="/course">← All lessons</Link>}
        {next ? <Link href={`/course/${next.id}`}>Next: {next.title} →</Link> : <Link href="/course">All lessons →</Link>}
      </nav>
    </main>
  );
}
