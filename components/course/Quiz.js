'use client';
// components/course/Quiz.js
// One quiz question. Click an answer: green means right, red means try again.
//
//   question -> the question
//   options  -> [{ label, right: true/false }]
//   rightText / wrongText -> what to say afterwards

import { useState } from 'react';

export default function Quiz({ question, options, rightText, wrongText }) {
  // Which answers have been clicked so far (so we can colour them).
  const [picked, setPicked] = useState([]);
  // The message to show under the answers.
  const [feedback, setFeedback] = useState(null);

  function choose(option) {
    setPicked((current) => [...current, option.label]);
    setFeedback({ right: Boolean(option.right), text: option.right ? rightText : wrongText });
  }

  return (
    <div className="quiz rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="font-bold text-slate-900">{question}</p>
      <div className="mt-3 flex flex-col gap-2">
        {options.map((option) => {
          let colours = 'border-slate-300 bg-white text-slate-700 hover:border-blue-400 hover:bg-blue-50';
          if (picked.includes(option.label)) {
            colours = option.right
              ? 'is-right border-emerald-500 bg-emerald-50 text-emerald-800'
              : 'is-wrong border-rose-400 bg-rose-50 text-rose-800';
          }
          return (
            <button
              key={option.label}
              type="button"
              className={`rounded-lg border-2 px-4 py-2 text-left font-semibold transition ${colours}`}
              onClick={() => choose(option)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      <p className="quiz-feedback mt-3 min-h-6 font-bold" role="status">
        {feedback && (feedback.right ? '✅ ' : '🤔 ') + feedback.text}
      </p>
    </div>
  );
}
