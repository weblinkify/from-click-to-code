'use client';
// components/course/Quiz.js
// One quiz question. Click an answer: green means right, red means try again.
//
//   question -> the question (can include <code> etc.)
//   options  -> [{ label, right: true/false }]
//   rightText / wrongText -> what to say afterwards

import { useState } from 'react';

export default function Quiz({ question, options, rightText, wrongText }) {
  // Which answers have been clicked so far (so we can colour them).
  const [picked, setPicked] = useState([]);
  // The message to show under the answers.
  const [feedback, setFeedback] = useState('');

  function choose(option) {
    setPicked((current) => [...current, option.label]);
    setFeedback(option.right ? '✅ ' + rightText : '🤔 ' + wrongText);
  }

  return (
    <div className="quiz">
      <p>{question}</p>
      {options.map((option) => {
        let className = 'secondary small';
        if (picked.includes(option.label)) {
          className = option.right ? 'small is-right' : 'small is-wrong';
        }
        return (
          <button key={option.label} type="button" className={className} onClick={() => choose(option)}>
            {option.label}
          </button>
        );
      })}
      <p className="quiz-feedback" role="status">
        {feedback}
      </p>
    </div>
  );
}
