'use client';
// app/course/security/page.js  ->  http://localhost:3000/course/security
// Lesson 15: the security lab. Try the classic sneaky tricks against our
// app, SAFELY, and watch which defence stops each one.
//
// Everything here is harmless: the tricks only touch your own account,
// and the "robot" attacks a made-up username that nobody uses.

import { useState } from 'react';
import Link from 'next/link';
import LessonFrame from '../../../components/course/LessonFrame.js';
import Experiment from '../../../components/course/Experiment.js';
import Quiz from '../../../components/course/Quiz.js';
import CodeLink from '../../../components/course/CodeLink.js';
import { sendWithApp, sendRaw } from '../../../lib/course/send.js';

const XSS_TEXT = '<img src="nope" onerror="alert(\'hi\')">';
const SQL_TEXT = "' OR '1'='1";

// The box that shows what happened in one experiment.
function LabResult({ result }) {
  if (!result) {
    return null;
  }
  return (
    <div className={result.blocked ? 'lab-result is-blocked' : 'lab-result'} role="status">
      <p className="lab-verdict">{result.verdict}</p>
      {result.details}
    </div>
  );
}

// Trick 1: sneak code into a todo (XSS).
function XssTrick() {
  const [result, setResult] = useState(null);

  async function tryIt() {
    const answer = await sendWithApp('POST', '/todos', { text: XSS_TEXT });
    if (answer.status === 401) {
      setResult({ verdict: '🎟️ Please log in first (then come back).', details: null });
      return;
    }
    setResult({
      blocked: true,
      verdict: '🛡️ Blocked! No pop-up appeared.',
      details: (
        <>
          <p>The server saved your todo exactly as typed (status {answer.status}). Here&apos;s how React shows it:</p>
          {/* React puts {text} on the page as plain letters, never as code. */}
          <p className="lab-preview">{answer.data.todo ? answer.data.todo.text : XSS_TEXT}</p>
          <p>
            <b>Defence:</b> React always shows text as letters. And even if a script did sneak in, the
            Content-Security-Policy only lets scripts with today&apos;s secret nonce run.
          </p>
        </>
      ),
    });
  }

  return (
    <Experiment title="🧪 Trick 1: Sneak code into a todo (XSS)">
      <p>
        A sneaky person adds a todo that is secretly HTML code:
      </p>
      <pre>{XSS_TEXT}</pre>
      <p>If the app treated it as code, everyone viewing it would get a pop-up (or worse).</p>
      <button type="button" className="small" onClick={tryIt}>Try the trick</button>
      <LabResult result={result} />
      <p><CodeLink path="components/TodoItem.js">See components/TodoItem.js</CodeLink></p>
    </Experiment>
  );
}

// Trick 2: type database commands into the todo box (SQL injection).
function SqlTrick() {
  const [result, setResult] = useState(null);

  async function tryIt() {
    const created = await sendWithApp('POST', '/todos', { text: SQL_TEXT });
    if (created.status === 401) {
      setResult({ verdict: '🎟️ Please log in first (then come back).', details: null });
      return;
    }
    const list = await sendWithApp('GET', '/todos');
    const todos = list.data.todos || [];
    setResult({
      blocked: true,
      verdict: '🛡️ Blocked! It was saved as plain text.',
      details: (
        <>
          <p>
            Your list still only has <b>your</b> {todos.length} todo{todos.length === 1 ? '' : 's'}, and the newest one
            says exactly: <code>{created.data.todo ? created.data.todo.text : SQL_TEXT}</code>
          </p>
          <p>
            <b>Defence:</b> every database question uses <code>?</code> placeholders, so your words travel separately
            from the command and can never become part of it.
          </p>
        </>
      ),
    });
  }

  return (
    <Experiment title="🧪 Trick 2: Talk to the database directly (SQL injection)">
      <p>A sneaky person types a piece of a database command into the todo box:</p>
      <pre>{SQL_TEXT}</pre>
      <p>If the app glued it into its SQL, the database might hand over <i>everybody&apos;s</i> todos.</p>
      <button type="button" className="small" onClick={tryIt}>Try the trick</button>
      <LabResult result={result} />
      <p><CodeLink path="lib/db/database.js">See lib/db/database.js</CodeLink></p>
    </Experiment>
  );
}

// Trick 3: change a todo that isn't yours, just by changing the number.
function PeekTrick() {
  const [result, setResult] = useState(null);

  async function tryIt() {
    const list = await sendWithApp('GET', '/todos');
    if (list.status === 401) {
      setResult({ verdict: '🎟️ Please log in first (then come back).', details: null });
      return;
    }
    // Pick a todo number that is NOT one of yours.
    const myIds = (list.data.todos || []).map((todo) => todo.id);
    let targetId = 1;
    while (myIds.includes(targetId)) {
      targetId = targetId + 1;
    }
    const answer = await sendWithApp('PUT', `/todos/${targetId}`, { completed: true });
    setResult({
      blocked: answer.status === 404,
      verdict: answer.status === 404 ? `🛡️ Blocked! Todo ${targetId} is "not found".` : `Status ${answer.status}`,
      details: (
        <>
          <p>
            You asked to change todo <b>{targetId}</b>, which isn&apos;t yours. The app answered{' '}
            <b>{answer.status}</b>: <code>{answer.data.error}</code>
          </p>
          <p>
            <b>Defence:</b> every todo query also checks <code>user_id = ?</code> (who owns it). Someone else&apos;s
            todo is treated as if it doesn&apos;t exist, so the app doesn&apos;t even reveal whether it&apos;s there.
          </p>
        </>
      ),
    });
  }

  return (
    <Experiment title="🧪 Trick 3: Change someone else's todo (IDOR)">
      <p>
        Todo numbers just count up: 1, 2, 3… What if you sent <code>PUT /todos/&lt;someone else&apos;s number&gt;</code>?
        We&apos;ll pick a number that isn&apos;t one of yours and try.
      </p>
      <button type="button" className="small" onClick={tryIt}>Try the trick</button>
      <LabResult result={result} />
      <p><CodeLink path="app/todos/[id]/route.js">See app/todos/[id]/route.js</CodeLink></p>
    </Experiment>
  );
}

// Trick 4: send a change WITHOUT the secret handshake (like a sneaky website would).
function CsrfTrick() {
  const [result, setResult] = useState(null);

  async function tryIt() {
    // Plain fetch, with NO X-CSRF-Token header. Exactly what a sneaky site's form would send.
    const answer = await sendRaw('POST', '/todos', { body: { text: 'Added by a sneaky website' } });
    setResult({
      blocked: answer.status === 403,
      verdict: answer.status === 403 ? '🛡️ Blocked with 403 Forbidden!' : `Status ${answer.status}`,
      details: (
        <>
          <p>
            Your browser sent your cookies along, but the request had no secret handshake token. The server said:{' '}
            <code>{answer.data.error}</code>
          </p>
          <p>
            <b>Defence:</b> every change needs the CSRF token in a special header. Other websites can make your browser
            send requests, but they can&apos;t read the token, so they can&apos;t copy it.
          </p>
        </>
      ),
    });
  }

  return (
    <Experiment title="🧪 Trick 4: A sneaky website acts as you (CSRF)">
      <p>
        You&apos;re logged in. A sneaky website quietly tells your browser to add a todo to <i>our</i> site. Your
        browser helpfully attaches your cookies…
      </p>
      <button type="button" className="small" onClick={tryIt}>Try the trick</button>
      <LabResult result={result} />
      <p><CodeLink path="lib/csrf.js">See lib/csrf.js</CodeLink></p>
    </Experiment>
  );
}

// Trick 5: a robot guesses passwords, very fast.
function GuessingTrick() {
  const [statuses, setStatuses] = useState([]);
  const [running, setRunning] = useState(false);

  async function tryIt() {
    setRunning(true);
    setStatuses([]);
    // A made-up account name, so we never lock out a real person.
    const target = 'robot-target-' + Math.floor(Math.random() * 1000000);
    const guesses = ['123456', 'password', 'qwerty', 'letmein', 'iloveyou', 'sunshine', 'dragon'];
    for (const guess of guesses) {
      const answer = await sendWithApp('POST', '/auth/login', { username: target, password: guess });
      setStatuses((current) => [...current, { guess, status: answer.status }]);
    }
    setRunning(false);
  }

  const wasLimited = statuses.some((attempt) => attempt.status === 429);

  return (
    <Experiment title="🧪 Trick 5: A robot guesses passwords">
      <p>A robot tries the most common passwords, one after another, as fast as it can.</p>
      <button type="button" className="small" onClick={tryIt} disabled={running}>
        {running ? 'The robot is guessing…' : 'Start the robot 🤖'}
      </button>
      {statuses.length > 0 && (
        <ol className="guess-list">
          {statuses.map((attempt, index) => (
            <li key={index} className={attempt.status === 429 ? 'is-blocked' : ''}>
              <code>{attempt.guess}</code> → <b>{attempt.status}</b>{' '}
              {attempt.status === 429 ? '🚦 Too many tries, wait!' : '❌ wrong'}
            </li>
          ))}
        </ol>
      )}
      {wasLimited && (
        <LabResult
          result={{
            blocked: true,
            verdict: '🛡️ Blocked! After a few wrong guesses, the door stays shut.',
            details: (
              <p>
                <b>Defence:</b> login is rate limited per username: only a few tries, then a wait. A robot that needs
                millions of guesses would need years.
              </p>
            ),
          }}
        />
      )}
      <p><CodeLink path="lib/rate-limit.js">See lib/rate-limit.js</CodeLink></p>
    </Experiment>
  );
}

export default function SecurityLesson() {
  return (
    <LessonFrame lessonId="security">
      <p>
        A <b>security review</b> means asking one question over and over:{' '}
        <i>&quot;If I were a sneaky person, how could I misuse this?&quot;</i> Today you get to be the (friendly)
        sneaky person, safely, against your own app.
      </p>
      <p className="muted">
        Tricks 1–4 need you to be logged in: <Link href="/login">log in</Link> in this tab first, then come back.
      </p>

      <XssTrick />
      <SqlTrick />
      <PeekTrick />
      <CsrfTrick />
      <GuessingTrick />

      <Experiment title="🧠 Quick quiz">
        <Quiz
          question="Why does our app answer 404 (not 403) when you ask for someone else's todo?"
          options={[{ label: 'So you can\'t even find out that it exists', right: true }, { label: 'Because the server is broken' }]}
          rightText="Yes! To you, it simply isn't there."
          wrongText="The server is fine. It's hiding something on purpose…"
        />
        <Quiz
          question="Which defence stopped the robot?"
          options={[{ label: 'HTTPS' }, { label: 'Rate limiting', right: true }, { label: 'The CSRF token' }]}
          rightText="Right: only a few tries, then you must wait."
          wrongText="Not that one. Look at the 429 answers again."
        />
      </Experiment>

      <Experiment title="🛠️ Mini challenge" variant="challenge">
        <p>
          Open your todos page. Find the todos the lab added. Do they look scary, or just like funny text? Tidy up by
          deleting them. Then visit <a href="/metrics">/metrics</a>: did <code>loginsFailed</code> go up because of the
          robot?
        </p>
      </Experiment>
    </LessonFrame>
  );
}
