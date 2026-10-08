'use client';
// app/course/incident/page.js  ->  http://localhost:3000/course/incident
// Lesson 20: the incident control room. A live dashboard that checks the
// app's pulse every 2 seconds, so you can WATCH an outage happen during
// the BREAK_DATABASE drill, and watch it get fixed.

import { useEffect, useState } from 'react';
import LessonFrame from '../../../components/course/LessonFrame.js';
import Experiment from '../../../components/course/Experiment.js';
import Quiz from '../../../components/course/Quiz.js';
import CodeLink from '../../../components/course/CodeLink.js';
import AnswerBox from '../../../components/course/AnswerBox.js';
import { sendRaw, sendWithApp } from '../../../lib/course/send.js';

const CHECK_EVERY_MS = 2000;
const HISTORY_LENGTH = 30;

// Turn a health answer into a light colour and a sentence.
function describeHealth(status) {
  if (status === 200) {
    return { light: 'green', words: 'Healthy: the app and its database are working.' };
  }
  if (status === 503) {
    return { light: 'red', words: 'UNHEALTHY: the app is running, but its database is not answering!' };
  }
  if (status === 0) {
    return { light: 'grey', words: 'No answer at all: the app is switched off (or restarting).' };
  }
  return { light: 'amber', words: `Something odd: status ${status}.` };
}

// The live dashboard: health light, history dots and counters.
function Dashboard() {
  const [history, setHistory] = useState([]);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    async function checkPulse() {
      // Ask "are you alive?"
      const health = await sendRaw('GET', '/health');
      // Remember the answer, keeping only the most recent ones.
      setHistory((current) => [...current, { status: health.status, time: new Date() }].slice(-HISTORY_LENGTH));
      // And read the counters.
      const counters = await sendRaw('GET', '/metrics');
      setMetrics(counters.status === 200 ? counters.data : null);
    }
    checkPulse();
    // Check again every 2 seconds...
    const timer = setInterval(checkPulse, CHECK_EVERY_MS);
    // ...and stop when you leave the page.
    return () => clearInterval(timer);
  }, []);

  const latest = history[history.length - 1];
  const now = latest ? describeHealth(latest.status) : null;

  return (
    <Experiment title="📟 The live dashboard">
      {now && (
        <div className="status-panel">
          <span className={`status-light light-${now.light}`} aria-hidden="true"></span>
          <div>
            <p className="status-words" data-testid="health-words">{now.words}</p>
            <p className="muted">
              GET /health → <b>{latest.status || 'no answer'}</b> at {latest.time.toLocaleTimeString()}
            </p>
          </div>
        </div>
      )}

      <p className="muted">The last {HISTORY_LENGTH} checks (newest on the right):</p>
      <div className="history-dots" aria-label="health history">
        {history.map((check, index) => (
          <span key={index} className={`history-dot light-${describeHealth(check.status).light}`} title={`${check.status}`}></span>
        ))}
      </div>

      {metrics && (
        <table className="parts-table metrics-table">
          <tbody>
            <tr><td>requestsTotal</td><td>{metrics.requestsTotal}</td><td>Requests answered since the app started</td></tr>
            <tr><td>errorsTotal</td><td data-testid="errors-total">{metrics.errorsTotal}</td><td>Answers that were 5xx (server problems)</td></tr>
            <tr><td>todosCreated</td><td>{metrics.todosCreated}</td><td>Todos added</td></tr>
            <tr><td>loginsFailed</td><td>{metrics.loginsFailed}</td><td>Wrong passwords (lots = maybe a robot!)</td></tr>
            <tr><td>uptimeSeconds</td><td>{metrics.uptimeSeconds}</td><td>How long since the app last started</td></tr>
          </tbody>
        </table>
      )}
      <p>
        <CodeLink path="app/health/route.js">app/health/route.js</CodeLink> ·{' '}
        <CodeLink path="lib/metrics.js">lib/metrics.js</CodeLink>
      </p>
    </Experiment>
  );
}

// "Be a user": make a request and see what a user would see.
function BeAUser() {
  const [answer, setAnswer] = useState(null);
  const helpCode = answer && answer.data.requestId ? answer.data.requestId.slice(0, 8) : null;

  return (
    <Experiment title="🙋 Be a user">
      <p>Pretend you&apos;re a user opening your todo list. What do you see?</p>
      <button type="button" className="small" onClick={async () => setAnswer(await sendWithApp('GET', '/todos'))}>
        Load my todos
      </button>
      <AnswerBox answer={answer} />
      {helpCode && (
        <div className="answer-box">
          <p>
            The user sees a calm message and a <b>help code</b>: <code>{helpCode}</code>. Find the full story in the logs:
          </p>
          <pre>{`docker compose logs app | grep ${helpCode}`}</pre>
          <p className="muted">(Running with npm run dev? Look in that terminal for the same code.)</p>
        </div>
      )}
    </Experiment>
  );
}

export default function IncidentLesson() {
  return (
    <LessonFrame lessonId="incident">
      <p>
        Even the best apps break sometimes. When something goes wrong for real users, it&apos;s called an{' '}
        <b>incident</b>. Professionals don&apos;t panic. They follow steps they&apos;ve <b>practised</b>, just like a
        fire drill. 🔥
      </p>
      <pre className="diagram">{`DETECT → INVESTIGATE → FIND THE CAUSE → FIX → PREVENT → LEARN
"it's     read the       "aha, the        restart  add a     write it up
 broken!"  logs           database!"       /revert  test      (no blame)`}</pre>

      <Dashboard />

      <Experiment title="🚨 The drill" variant="challenge">
        <ol className="drill-steps">
          <li>
            <b>Everything is fine.</b> <a href="/login">Log in</a> and add a todo. The light above should be 🟢 green.
          </li>
          <li>
            <b>Break it.</b> A grown-up stops the app (Ctrl+C) and starts it again with the drill switch:
            <pre>BREAK_DATABASE=true docker compose up</pre>
            <span className="muted">(or <code>BREAK_DATABASE=true npm run dev</code>). Keep this page open and watch the dots!</span>
          </li>
          <li>
            <b>Detect.</b> The light turns 🔴 red: <code>/health</code> says 503. Press <b>Load my todos</b> below. What
            does a user see?
          </li>
          <li>
            <b>Investigate.</b> Search the logs for the help code. What does the <code>error</code> say?
          </li>
          <li>
            <b>Fix.</b> Stop the app and start it normally (<code>docker compose up</code>). Watch the light go back to 🟢.
            Are your todos still there?
          </li>
          <li>
            <b>Learn.</b> Read the rest of the drill (rolling back with <code>git revert</code>, adding a test, and
            writing a blameless report) in the full lesson below.
          </li>
        </ol>
        <p>
          <CodeLink path="lib/db/database.js">Where the drill switch lives: lib/db/database.js</CodeLink>
        </p>
      </Experiment>

      <BeAUser />

      <Experiment title="🧠 Quick quiz">
        <Quiz
          question="The light is red but the page still loads. What does that tell you?"
          options={[{ label: 'The app is running, but its database is broken', right: true }, { label: 'The whole computer is off' }]}
          rightText="Exactly. If the whole app were off, there'd be no answer at all (grey)."
          wrongText="If it were off, nothing would answer. Something answered with 503…"
        />
        <Quiz
          question="Why does the user see a help code instead of the real error?"
          options={[{ label: 'Real details could help attackers and confuse users', right: true }, { label: 'To save space' }]}
          rightText="Right! The details go in the logs, where only the team looks."
          wrongText="Think about who else might read an error message…"
        />
      </Experiment>
    </LessonFrame>
  );
}
