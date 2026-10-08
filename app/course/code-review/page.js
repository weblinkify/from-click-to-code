'use client';
// app/course/code-review/page.js  ->  http://localhost:3000/course/code-review
// Lesson 14: Spot the bug! A code review game.
//
// Each round shows some code with a mistake in it. Click the line you
// think is the problem. Then see what could go wrong, and the fix.

import { useState } from 'react';
import LessonFrame from '../../../components/course/LessonFrame.js';
import Experiment from '../../../components/course/Experiment.js';
import Quiz from '../../../components/course/Quiz.js';
import CodeLink from '../../../components/course/CodeLink.js';
import { ROUNDS } from '../../../lib/course/code-review-rounds.js';

// Shows code with line numbers. If onPick is given, each line is a button.
function CodeBlock({ lines, onPick, picked, highlighted, label }) {
  return (
    <ol className="code-block" aria-label={label}>
      {lines.map((line, index) => {
        const lineNumber = index + 1;
        let className = 'code-line';
        if (highlighted.includes(lineNumber)) {
          className = className + ' is-bug';
        } else if (picked.includes(lineNumber)) {
          className = className + ' is-picked';
        }
        return (
          <li key={lineNumber} className={className}>
            {onPick ? (
              <button type="button" className="code-line-button" onClick={() => onPick(lineNumber)} aria-label={`Line ${lineNumber}: ${line}`}>
                <span className="line-number">{lineNumber}</span>
                <code>{line || ' '}</code>
              </button>
            ) : (
              <span className="code-line-static">
                <span className="line-number">{lineNumber}</span>
                <code>{line || ' '}</code>
              </span>
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
        <p className="lead">
          You spotted <b>{score}</b> of {ROUNDS.length} bugs on the first try.
        </p>
        <p>
          Every one of these mistakes happens in real projects. Spotting them in a code review, before the code goes
          live, is one of the most useful things a teammate can do.
        </p>
        <button type="button" className="small" onClick={() => { setRoundIndex(0); setScore(0); setPicked([]); setSolved(false); setFeedback(''); }}>
          Play again
        </button>
      </Experiment>
    );
  }

  return (
    <Experiment title={`🔎 Round ${roundIndex + 1} of ${ROUNDS.length}: ${round.title}`}>
      <p>{round.story}</p>
      <p>
        <b>Click the line you think is the problem.</b> <span className="muted">Score: {score}</span>
      </p>

      <CodeBlock lines={round.lines} onPick={pickLine} picked={picked} highlighted={solved ? round.buggyLines : []} label="Code to review" />

      <p className="quiz-feedback" role="status">{feedback}</p>

      {!solved && (
        <button type="button" className="secondary small" onClick={reveal}>
          I give up, show me
        </button>
      )}

      {solved && (
        <div className="review-result">
          <h3>😱 What could go wrong</h3>
          <p>{round.problem}</p>
          <h3>✅ The fix</h3>
          <CodeBlock lines={round.fixedLines} picked={[]} highlighted={[]} label="Fixed code" />
          <p>{round.fixNote}</p>
          <p className="muted">
            <CodeLink path={round.badExample}>Read the full write-up</CodeLink> ·{' '}
            <CodeLink path={round.realCode}>See how our app does it</CodeLink>
          </p>
          <button type="button" onClick={nextRound}>
            {isLastRound ? 'See my score 🏆' : 'Next round →'}
          </button>
        </div>
      )}
    </Experiment>
  );
}

export default function CodeReviewLesson() {
  return (
    <LessonFrame lessonId="code-review">
      <p>
        Before new code joins a real app, <b>another person reads it</b>. This is a <b>code review</b>. It&apos;s like
        asking a friend to read your story before you hand it in: they spot things you couldn&apos;t see, because{' '}
        <i>you</i> knew what you meant.
      </p>
      <p>
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

      <Experiment title="🛠️ Mini challenge" variant="challenge">
        <p>
          Open <CodeLink path="app/todos/route.js">app/todos/route.js</CodeLink> and be the reviewer. Find one thing
          you like, and one question you&apos;d ask the author. Write them down as kind review comments.
        </p>
      </Experiment>
    </LessonFrame>
  );
}
