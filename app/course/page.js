'use client';
// app/course/page.js  ->  http://localhost:3000/course
// The home page of the interactive course: a list of lessons, with a
// star ⭐ next to the ones you've finished.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LESSONS, codeLink } from '../../lib/course/lessons.js';
import { readFinished } from '../../lib/course/progress.js';

export default function CourseHome() {
  const [finished, setFinished] = useState([]);

  // Read the notebook once the page is in the browser.
  useEffect(() => {
    setFinished(readFinished());
  }, []);

  return (
    <main className="card course">
      <p>
        <Link href="/">← Back to the app</Link>
      </p>
      <h1>📚 How the web works</h1>
      <p className="lead">
        Lessons you can <b>play with</b>. Every experiment uses this very app, running on
        your computer right now!
      </p>
      <p className="muted">
        Before you start: <Link href="/login">make an account</Link> and add two or three todos,
        then tick one off. Some experiments use your list.
      </p>

      <ol className="lesson-list">
        {LESSONS.map((lesson) => (
          <li key={lesson.id}>
            <Link className="lesson-link" href={`/course/${lesson.id}`}>
              <span className="lesson-number">{lesson.number}</span>
              <span className="lesson-words">
                <b>
                  {lesson.title} {lesson.emoji}
                </b>
                <br />
                <span className="muted">{lesson.blurb}</span>
              </span>
              {finished.includes(lesson.id) && (
                <span className="lesson-star" aria-label="finished">
                  ⭐
                </span>
              )}
            </Link>
          </li>
        ))}
      </ol>

      <p className="muted">
        You&apos;ve finished {finished.length} of {LESSONS.length} lessons. All 22 written lessons
        are in the{' '}
        <a href={codeLink('lessons/README.md')} target="_blank" rel="noopener noreferrer">
          lessons folder
        </a>
        .
      </p>
    </main>
  );
}
