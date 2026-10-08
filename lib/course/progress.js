// lib/course/progress.js
// Remembers which lessons you've finished, in YOUR browser only, using
// "localStorage" (a little notebook each website gets inside the browser).
//
// It's only a nice extra: if the browser won't let us write in the
// notebook (e.g. a private window), the course still works fine.

const STORAGE_KEY = 'kids-todo-course-finished';

function readFinished() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function markFinished(lessonId) {
  try {
    const finished = new Set(readFinished());
    finished.add(lessonId);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...finished]));
  } catch {
    // The notebook is locked. That's OK, we just won't remember.
  }
}

export { readFinished, markFinished };
