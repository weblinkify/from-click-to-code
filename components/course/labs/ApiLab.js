'use client';
// components/course/labs/ApiLab.js
// The hands-on lab for Lesson 10: talk to the API yourself, just like the
// frontend does. Shown in the course player at http://localhost:3000/course/api

import { useState } from 'react';
import Experiment from '../Experiment.js';
import Quiz from '../Quiz.js';
import AnswerBox from '../AnswerBox.js';
import CodeLink from '../CodeLink.js';
import { sendWithApp } from '../../../lib/course/send.js';
import ui from '../../../lib/ui.js';

// Table styles.
const TABLE = 'w-full overflow-hidden rounded-xl border border-slate-200 bg-white text-left text-sm';
const CELL = 'border-b border-slate-100 px-3 py-2';

// Ready-made orders from the "menu". Click one to fill in the form.
const PRESETS = [
  { label: '📋 Show my todos', method: 'GET', path: '/todos', body: '' },
  { label: '✅ Only finished ones', method: 'GET', path: '/todos?completed=true', body: '' },
  { label: '➕ Add a todo', method: 'POST', path: '/todos', body: '{\n  "text": "Learn about APIs"\n}' },
  { label: '☑️ Tick off todo 1', method: 'PUT', path: '/todos/1', body: '{\n  "completed": true\n}' },
  { label: '🗑️ Delete todo 1', method: 'DELETE', path: '/todos/1', body: '' },
  { label: '🙈 Add an EMPTY todo', method: 'POST', path: '/todos', body: '{\n  "text": "   "\n}' },
  { label: '🙋 Who am I?', method: 'GET', path: '/auth/me', body: '' },
];

const METHODS = ['GET', 'POST', 'PUT', 'DELETE'];

// What each method means.
const METHOD_MEANINGS = {
  GET: '"Please give me…" (only reads, changes nothing)',
  POST: '"Here\'s something new…"',
  PUT: '"Please change this…"',
  DELETE: '"Please throw this away."',
};

function RequestBuilder() {
  const [method, setMethod] = useState('GET');
  const [path, setPath] = useState('/todos');
  const [body, setBody] = useState('');
  const [answer, setAnswer] = useState(null);
  const [problem, setProblem] = useState('');

  function usePreset(preset) {
    setMethod(preset.method);
    setPath(preset.path);
    setBody(preset.body);
    setProblem('');
  }

  async function send(event) {
    event.preventDefault();
    setProblem('');

    // Only POST and PUT carry a body. Check it's real JSON first.
    let parsedBody;
    if ((method === 'POST' || method === 'PUT') && body.trim() !== '') {
      try {
        parsedBody = JSON.parse(body);
      } catch {
        setProblem('That body isn\'t valid JSON. Check the quotes "like this" and the { curly braces }.');
        return;
      }
    }
    setAnswer(await sendWithApp(method, path, parsedBody));
  }

  const needsBody = method === 'POST' || method === 'PUT';

  return (
    <Experiment title="🔬 Experiment: Be the frontend">
      <p>Pick something from the menu, or write your own order. Then press <b>Send</b>.</p>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <button key={preset.label} type="button" className={ui.smallSecondaryButton} onClick={() => usePreset(preset)}>
            {preset.label}
          </button>
        ))}
      </div>

      <form className="rounded-xl border border-slate-200 bg-slate-50 p-4" onSubmit={send}>
        <div className="flex flex-col gap-2 sm:flex-row">
          <label htmlFor="api-method" className="sr-only">Method</label>
          <select
            id="api-method"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-mono font-bold text-blue-700"
            value={method} onChange={(event) => setMethod(event.target.value)}>
            {METHODS.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
          <label htmlFor="api-path" className="sr-only">Path</label>
          <input id="api-path" className={`${ui.input} font-mono`} value={path} onChange={(event) => setPath(event.target.value)} spellCheck={false} />
          <button type="submit" className={ui.primaryButton}>
            Send
          </button>
        </div>
        <p className="mt-2 text-sm text-slate-600">
          <b>{method}</b> means {METHOD_MEANINGS[method]}
        </p>
        {needsBody && (
          <>
            <label htmlFor="api-body" className={ui.label}>
              Body (JSON)
            </label>
            <textarea id="api-body" className={`${ui.input} font-mono text-sm`} rows={4} value={body} onChange={(event) => setBody(event.target.value)} spellCheck={false} />
          </>
        )}
      </form>

      {problem && <p className="font-bold text-rose-700">{problem}</p>}
      <AnswerBox answer={answer} />
      <p className="text-sm text-slate-500">
        Not logged in? You&apos;ll get <b>401</b>.{' '}
        <a href="/login" className={ui.link}>
          Log in
        </a>{' '}
        in another tab, then try again.
      </p>
    </Experiment>
  );
}

export default function ApiLab() {
  return (
    <>
      <p className="text-slate-700">
        An <b>API</b> is the list of things one program can ask another program to do. It&apos;s like the{' '}
        <b>menu in a restaurant</b>: you order from the menu, in the way the menu says, and the kitchen sends back
        exactly what it promised.
      </p>
      <p className="text-slate-700">
        Our app&apos;s frontend (the dining room) orders from the backend (the kitchen) all day long. Now <b>you</b> get
        to be the frontend!
      </p>

      <table className={TABLE}>
        <thead className="bg-slate-50">
          <tr>
            <th className={CELL}>Method</th>
            <th className={CELL}>Path</th>
            <th className={CELL}>What it does</th>
          </tr>
        </thead>
        <tbody>
          <tr><td className={`${CELL} font-mono font-bold text-blue-700`}>GET</td><td className={`${CELL} font-mono`}>/todos</td><td className={CELL}>List my todos</td></tr>
          <tr><td className={`${CELL} font-mono font-bold text-blue-700`}>POST</td><td className={`${CELL} font-mono`}>/todos</td><td className={CELL}>Add a todo</td></tr>
          <tr><td className={`${CELL} font-mono font-bold text-blue-700`}>PUT</td><td className={`${CELL} font-mono`}>/todos/:id</td><td className={CELL}>Change a todo</td></tr>
          <tr><td className={`${CELL} font-mono font-bold text-blue-700`}>DELETE</td><td className={`${CELL} font-mono`}>/todos/:id</td><td className={CELL}>Delete a todo</td></tr>
          <tr><td className={`${CELL} font-mono font-bold text-blue-700`}>GET</td><td className={`${CELL} font-mono`}>/auth/me</td><td className={CELL}>Who am I?</td></tr>
          <tr><td className={`${CELL} font-mono font-bold text-blue-700`}>GET</td><td className={`${CELL} font-mono`}>/health</td><td className={CELL}>Are you alive?</td></tr>
        </tbody>
      </table>

      <RequestBuilder />

      <p>
        <CodeLink path="app/todos/route.js">See the kitchen&apos;s code for /todos</CodeLink>
      </p>

      <Experiment title="🧠 Quick quiz">
        <Quiz
          question="Which method would you use to tick off a todo?"
          options={[{ label: 'GET' }, { label: 'PUT', right: true }, { label: 'DELETE' }]}
          rightText="Yes! PUT means 'please change this one'."
          wrongText="Not quite. You want to CHANGE the todo, not read or delete it."
        />
        <Quiz
          question="You sent an empty todo and got 400. Whose mistake was it?"
          options={[{ label: 'The request (4xx)', right: true }, { label: "The server's (5xx)" }]}
          rightText="Right! 4xx means something was wrong with the request."
          wrongText="Remember: 4xx = the request had a mistake, 5xx = the server broke."
        />
      </Experiment>

    </>
  );
}
