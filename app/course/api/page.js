'use client';
// app/course/api/page.js  ->  http://localhost:3000/course/api
// Lesson 10: talk to the API yourself, just like the frontend does.

import { useState } from 'react';
import LessonFrame from '../../../components/course/LessonFrame.js';
import Experiment from '../../../components/course/Experiment.js';
import Quiz from '../../../components/course/Quiz.js';
import AnswerBox from '../../../components/course/AnswerBox.js';
import CodeLink from '../../../components/course/CodeLink.js';
import { sendWithApp } from '../../../lib/course/send.js';

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
      <div className="button-row">
        {PRESETS.map((preset) => (
          <button key={preset.label} type="button" className="secondary small" onClick={() => usePreset(preset)}>
            {preset.label}
          </button>
        ))}
      </div>

      <form className="request-builder" onSubmit={send}>
        <div className="request-line">
          <label htmlFor="api-method" className="visually-hidden">Method</label>
          <select id="api-method" value={method} onChange={(event) => setMethod(event.target.value)}>
            {METHODS.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
          <label htmlFor="api-path" className="visually-hidden">Path</label>
          <input id="api-path" value={path} onChange={(event) => setPath(event.target.value)} spellCheck={false} />
          <button type="submit">Send</button>
        </div>
        <p className="muted">
          <b>{method}</b> means {METHOD_MEANINGS[method]}
        </p>
        {needsBody && (
          <>
            <label htmlFor="api-body">Body (JSON)</label>
            <textarea id="api-body" rows={4} value={body} onChange={(event) => setBody(event.target.value)} spellCheck={false} />
          </>
        )}
      </form>

      {problem && <p className="message">{problem}</p>}
      <AnswerBox answer={answer} />
      <p className="muted">
        Not logged in? You&apos;ll get <b>401</b>. <a href="/login">Log in</a> in another tab, then try again.
      </p>
    </Experiment>
  );
}

export default function ApiLesson() {
  return (
    <LessonFrame lessonId="api">
      <p>
        An <b>API</b> is the list of things one program can ask another program to do. It&apos;s like the{' '}
        <b>menu in a restaurant</b>: you order from the menu, in the way the menu says, and the kitchen sends back
        exactly what it promised.
      </p>
      <p>
        Our app&apos;s frontend (the dining room) orders from the backend (the kitchen) all day long. Now <b>you</b> get
        to be the frontend!
      </p>

      <table className="parts-table">
        <thead>
          <tr>
            <th>Method</th>
            <th>Path</th>
            <th>What it does</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>GET</td><td>/todos</td><td>List my todos</td></tr>
          <tr><td>POST</td><td>/todos</td><td>Add a todo</td></tr>
          <tr><td>PUT</td><td>/todos/:id</td><td>Change a todo</td></tr>
          <tr><td>DELETE</td><td>/todos/:id</td><td>Delete a todo</td></tr>
          <tr><td>GET</td><td>/auth/me</td><td>Who am I?</td></tr>
          <tr><td>GET</td><td>/health</td><td>Are you alive?</td></tr>
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

      <Experiment title="🛠️ Mini challenge" variant="challenge">
        <ol>
          <li>Add a todo with the request builder.</li>
          <li>Look at the answer: what <code>id</code> did the server give it?</li>
          <li>Now tick it off with <b>PUT</b>, using that id in the path.</li>
          <li>Open your todos page. Is it crossed out?</li>
        </ol>
      </Experiment>
    </LessonFrame>
  );
}
