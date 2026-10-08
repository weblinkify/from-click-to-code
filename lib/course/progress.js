// lib/course/progress.js
// Remembers which lessons you've finished, in YOUR browser only, using
// "localStorage" (a little notebook each website gets inside the browser).
//
// It's only a nice extra: if the browser won't let us write in the
// notebook (e.g. a private window), the course still works fine.

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'kids-todo-course-progress';
const CHANGE_EVENT = 'kids-todo:progress-changed';

function readFinished() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveFinished(slugs) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
  } catch {
    // The notebook is locked. That's OK, we just won't remember.
  }
  // Tell every part of the page (sidebar, progress bar…) to update.
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

function setFinished(slug, isFinished) {
  const finished = new Set(readFinished());
  if (isFinished) {
    finished.add(slug);
  } else {
    finished.delete(slug);
  }
  saveFinished([...finished]);
}

// A React "hook": any component can call useProgress() to get the list
// of finished lessons, and it redraws whenever the list changes.
function useProgress() {
  const [finished, setFinishedList] = useState([]);

  useEffect(() => {
    const update = () => setFinishedList(readFinished());
    update();
    window.addEventListener(CHANGE_EVENT, update);
    return () => window.removeEventListener(CHANGE_EVENT, update);
  }, []);

  return {
    finished,
    isFinished: (slug) => finished.includes(slug),
    setFinished,
  };
}

export { useProgress, setFinished };
