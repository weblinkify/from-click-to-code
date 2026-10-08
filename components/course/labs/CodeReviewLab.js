'use client';
// components/course/labs/CodeReviewLab.js
// The hands-on lab for Lesson 14: Spot the bug! A code review game.
// Shown in the course player at http://localhost:3000/course/code-review
//
// Each round shows some code with a mistake in it. Click the line you
// think is the problem. Then see what could go wrong, and the fix.

import { useState } from 'react';
import Experiment from '../Experiment.js';
import Quiz from '../Quiz.js';
import CodeLink from '../CodeLink.js';
import { ROUNDS } from '../../../lib/course/code-review-rounds.js';
import ui from '../../../lib/ui.js';

// Shows code with line numbers. If onPick is given, each line is a button.
//   highlighted -> line numbers to show in red (the bug)
//   picked      -> line numbers already clicked
function CodeBlock({ lines, onPick, picked, highlighted, label }) {
  return (
    <ol className="code-block overflow-x-auto rounded-xl bg-slate-900 py-2 font-mono text-sm" aria-label={label}>
      {lines.map((line, index) => {
        const lineNumber = index + 1;
        // Pick the background: red for the bug, dark red for a wrong guess.
        let background = onPick ? 'hover:bg-slate-700' : '';
        if (highlighted.includes(lineNumber)) {
          background = 'is-bug bg-rose-800';
        } else if (picked.includes(lineNumber)) {
          background = 'is-picked bg-rose-950';
        }
        const content = (
          <>
            <span className="w-6 shrink-0 select-none text-right text-slate-500">{lineNumber}</span>
            <code className="whitespace-pre text-slate-100">{line || ' '}</code>
          </>
        );
        return (
          <li key={lineNumber}>
            {onPick ? (
              <button
                type="button"
                className={`flex w-max min-w-full gap-4 px-4 py-0.5 text-left ${background}`}
                onClick={() => onPick(lineNumber)}
                aria-label={`Line ${lineNumber}: ${line}`}
              >
                {content}
              </button>
            ) : (
              <span className={`flex w-max min-w-full gap-4 px-4 py-0.5 ${background}`}>{content}</span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function ReviewGame() {
  // Which round we're on (0 = the first one).
  const [roundIndex, setRoundIndex] = useState(0);
  // The lines clicked so far in this round.
  const [picked, setPicked] = useState([]);
  // true once the bug has been found (or revealed).
  const [solved, setSolved] = useState(false);
  // How many rounds were solved on the FIRST try.
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');

  const round = ROUNDS[roundIndex];
  const isLastRound = roundIndex === ROUNDS.length - 1;
  const finishedAll = roundIndex >= ROUNDS.length;

  function pickLine(lineNumber) {
    if (solved) {
      return;
    }
    setPicked((current) => [...current, lineNumber]);
    if (round.buggyLines.includes(lineNumber)) {
      // Spotted it! A point if it was the first try.
      if (picked.length === 0) {
        setScore((current) => current + 1);
      }
      setSolved(true);
      setFeedback('🎉 You spotted it!');
    } else {
      setFeedback('🤔 That line looks OK. Hint: ' + round.hint);
    }
  }

  function reveal() {
    setSolved(true);
    setFeedback('👀 Here is the problem:');
  }

  function nextRound() {
    setRoundIndex((current) => current + 1);
    setPicked([]);
    setSolved(false);
    setFeedback('');
  }

  if (finishedAll) {
    return (
      <Experiment title="🏆 Review complete!">
        <p className="text-lg">
          You spotted <b>{score}</b> of {ROUNDS.length} bugs on the first try.
        </p>
        <p>
          Every one of these mistakes happens in real projects. Spotting them in a code review, before the code goes
          live, is one of the most useful things a teammate can do.
        </p>
        <button
          type="button"
          className={ui.smallButton}
          onClick={() => {
            setRoundIndex(0);
            setScore(0);
            setPicked([]);
            setSolved(false);
            setFeedback('');
          }}
        >
          Play again
        </button>
      </Experiment>
    );
  }

  return (
    <Experiment title={`🔎 Round ${roundIndex + 1} of ${ROUNDS.length}: ${round.title}`}>
      <p>{round.story}</p>
      <p className="flex flex-wrap items-center justify-between gap-2">
        <b>Click the line you think is the problem.</b>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-800">Score: {score}</span>
      </p>

      <CodeBlock lines={round.lines} onPick={pickLine} picked={picked} highlighted={solved ? round.buggyLines : []} label="Code to review" />

      <p className="min-h-6 font-bold" role="status">
        {feedback}
      </p>

      {!solved && (
        <button type="button" className={ui.smallSecondaryButton} onClick={reveal}>
          I give up, show me
        </button>
      )}

      {solved && (
        <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-lg font-extrabold text-rose-700">😱 What could go wrong</h3>
          <p>{round.problem}</p>
          <h3 className="text-lg font-extrabold text-emerald-700">✅ The fix</h3>
          <CodeBlock lines={round.fixedLines} picked={[]} highlighted={[]} label="Fixed code" />
          <p>{round.fixNote}</p>
          <p className="flex flex-wrap gap-3">
            <CodeLink path={round.badExample}>Read the full write-up</CodeLink>
            <CodeLink path={round.realCode}>See how our app does it</CodeLink>
          </p>
          <button type="button" className={ui.primaryButton} onClick={nextRound}>
            {isLastRound ? 'See my score 🏆' : 'Next round →'}
          </button>
        </div>
      )}
    </Experiment>
  );
}

export default function CodeReviewLab() {
  return (
    <>
      <p className="text-slate-700">
        Before new code joins a real app, <b>another person reads it</b>. This is a <b>code review</b>. It&apos;s like
        asking a friend to read your story before you hand it in: they spot things you couldn&apos;t see, because{' '}
        <i>you</i> knew what you meant.
      </p>
      <p className="text-slate-700">
        Reviews are about the <b>code</b>, never the <b>person</b>. Kind reviewers say things like{' '}
        <i>&quot;I think this might let an empty todo through. What do you think?&quot;</i>
      </p>

      <ReviewGame />

      <Experiment title="🧠 Quick quiz">
        <Quiz
          question="Is code review about finding out who made a mistake?"
          options={[{ label: 'Yes, so they can be told off' }, { label: 'No, it\'s about making the code better together', right: true }]}
          rightText="Exactly. Everyone's code gets reviewed, even experts'."
          wrongText="Nope! Reviews are teamwork. Everyone makes mistakes; reviews catch them early."
        />
        <Quiz
          question={'Which comment is kinder: "Bad name." or "Could we call this validateTodoText? I wasn\'t sure what check did."'}
          options={[{ label: 'Bad name.' }, { label: 'Could we call this validateTodoText?…', right: true }]}
          rightText="Yes! It explains why, and suggests a fix."
          wrongText="Short, but not very helpful. The other one says why and offers a fix."
        />
      </Experiment>

    </>
  );
}
