'use client';
// components/course/RevealAnswer.js
// A hidden answer that appears when you click, so you can try first!

import { useState } from 'react';

export default function RevealAnswer({ label, children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="reveal-answer my-3 rounded-xl border border-violet-200 bg-violet-50">
      <button
        type="button"
        className="flex w-full items-center justify-between px-4 py-2.5 text-left font-bold text-violet-800 hover:bg-violet-100"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <span>{open ? '🙈 Hide' : '👀 ' + label}</span>
        <span aria-hidden="true">{open ? '▴' : '▾'}</span>
      </button>
      {open && <div className="border-t border-violet-200 px-4 pb-3">{children}</div>}
    </div>
  );
}
