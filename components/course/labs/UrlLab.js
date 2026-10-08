'use client';
// components/course/labs/UrlLab.js
// The hands-on lab for Lesson 5: the parts of a URL.
// Shown in the course player at http://localhost:3000/course/url

import { useEffect, useState } from 'react';
import Experiment from '../Experiment.js';
import Quiz from '../Quiz.js';
import AnswerBox from '../AnswerBox.js';
import { sendRaw } from '../../../lib/course/send.js';
import ui from '../../../lib/ui.js';

// A pattern that splits a URL into its parts, exactly as it was typed:
//   scheme://host:port/path?query#fragment
const URL_PATTERN = /^([a-z][a-z0-9+.-]*:)\/\/([^/:?#]*)(:\d+)?([^?#]*)(\?[^#]*)?(#.*)?$/i;

// What each part means, in kid-friendly words. "className" picks its colour.
// Each part gets a colour (the "part-..." names are markers our tests look for).
const PARTS = [
  { key: 'scheme', name: 'Scheme', className: 'part-scheme font-bold text-fuchsia-700', meaning: 'HOW to talk. https = the sealed envelope 🔒, http = the postcard 📮.' },
  { key: 'host', name: 'Host', className: 'part-host font-bold text-blue-700', meaning: 'WHICH computer. Like the town and street of a postal address.' },
  { key: 'port', name: 'Port', className: 'part-port font-bold text-orange-600', meaning: 'WHICH door on that computer. One computer can have lots of doors.' },
  { key: 'path', name: 'Path', className: 'part-path font-bold text-emerald-700', meaning: 'WHICH thing you want on that computer, like a page or your todo list.' },
  { key: 'query', name: 'Query', className: 'part-query font-bold text-violet-700', meaning: 'EXTRA details, written as name=value and joined with &.' },
  { key: 'fragment', name: 'Fragment', className: 'part-fragment font-bold text-rose-700', meaning: 'A spot ON the page. Your browser keeps it; it is never sent to the server.' },
];

const EXAMPLES = [
  { label: 'Example', url: 'https://todos.example.com:443/todos?completed=true#top' },
  { label: 'Our app', url: 'http://localhost:3000/todos?completed=false' },
  { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Cat#Behavior' },
  { label: 'A search', url: 'https://www.google.com/search?q=cute+puppies&hl=en' },
];

// Table styles, used by every table in this lab.
const TABLE = 'w-full overflow-hidden rounded-xl border border-slate-200 bg-white text-left text-sm';
const CELL = 'border-b border-slate-100 px-3 py-2 align-top';

const TRY_PATHS = ['/todos', '/todos?completed=true', '/todos?completed=false', '/todos?completed=banana', '/health', '/no-such-api'];

// When no port is written, everyone uses the usual door for that scheme.
function usualPort(scheme) {
  if (scheme === 'https:') {
    return '443';
  }
  if (scheme === 'http:') {
    return '80';
  }
  return '?';
}

// Split a URL into { scheme, host, port, path, query, fragment }, or null.
function splitUrl(text) {
  const match = URL_PATTERN.exec(text.trim());
  if (!match) {
    return null;
  }
  return { scheme: match[1], host: match[2], port: match[3], path: match[4], query: match[5], fragment: match[6] };
}

// The words to show in the table for one part.
function partValue(parts, key) {
  if (key === 'scheme') {
    return parts.scheme.replace(':', '');
  }
  if (key === 'port') {
    return parts.port ? parts.port.slice(1) : `(not written, so the usual door: ${usualPort(parts.scheme)})`;
  }
  if (key === 'path') {
    return parts.path || '/';
  }
  return parts[key] || '(none)';
}

// Experiment 1: type a URL, see it in colours.
function UrlExplorer() {
  const [text, setText] = useState(EXAMPLES[0].url);
  const parts = splitUrl(text);

  return (
    <Experiment title="🔬 Experiment 1: Take a URL apart">
      <p>Type any web address, or press a button to try an example.</p>
      <label htmlFor="url-input" className={ui.label}>
        A web address
      </label>
      <input id="url-input" className={`${ui.input} font-mono`} value={text} onChange={(event) => setText(event.target.value)} spellCheck={false} autoComplete="off" />

      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map((example) => (
          <button key={example.label} type="button" className={ui.smallSecondaryButton} onClick={() => setText(example.url)}>
            {example.label}
          </button>
        ))}
      </div>

      {!parts && <p className="font-bold text-rose-700">Hmm, that doesn&apos;t look like a full web address. Try starting with https://</p>}

      {parts && (
        <>
          <p className="rounded-xl border-2 border-slate-200 bg-white p-4 font-mono text-lg break-all" data-testid="url-colored">
            <span className={PARTS[0].className}>{parts.scheme}</span>
            <span className="text-slate-400">//</span>
            {PARTS.slice(1).map((part) =>
              parts[part.key] ? (
                <span key={part.key} className={part.className}>
                  {parts[part.key]}
                </span>
              ) : null
            )}
          </p>
          <table className={TABLE}>
            <thead className="bg-slate-50">
              <tr>
                <th className={CELL}>Part</th>
                <th className={CELL}>In your URL</th>
                <th className={CELL}>What it means</th>
              </tr>
            </thead>
            <tbody>
              {PARTS.map((part) => (
                <tr key={part.key}>
                  <td className={`${CELL} ${part.className}`}>{part.name}</td>
                  <td className={`${CELL} font-mono break-all`}>{partValue(parts, part.key)}</td>
                  <td className={CELL}>{part.meaning}</td>
                </tr>
              ))}
              {parts.query &&
                [...new URLSearchParams(parts.query)].map(([name, value]) => (
                  <tr key={name + value}>
                    <td className={CELL}></td>
                    <td className={`${CELL} font-mono text-violet-700`}>
                      {name} = {value}
                    </td>
                    <td className={CELL}>
                      &quot;{name}&quot; is set to &quot;{value}&quot;
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </>
      )}
    </Experiment>
  );
}

// Experiment 2: ask the real app with different URLs.
function TryUrls() {
  const [answer, setAnswer] = useState(null);

  async function tryPath(path) {
    setAnswer(await sendRaw('GET', path));
  }

  return (
    <Experiment title="🔬 Experiment 2: Ask our app with different URLs">
      <p>
        Each button sends a real request to the app on your computer. Watch how changing the{' '}
        <span className="font-bold text-emerald-700">path</span> or the{' '}
        <span className="font-bold text-violet-700">query</span> changes the answer.
      </p>
      <div className="flex flex-wrap gap-2">
        {TRY_PATHS.map((path) => (
          <button key={path} type="button" className={`${ui.smallButton} font-mono`} onClick={() => tryPath(path)}>
            {path}
          </button>
        ))}
      </div>
      <AnswerBox answer={answer} />
      <p className="text-sm text-slate-500">
        2xx = 🙂 it worked · 4xx = 🤔 something was wrong with the request · 5xx = 😵 the server had a problem.
        Got <b>401</b> for the /todos buttons?{' '}
        <a href="/login" className={ui.link}>
          Log in
        </a>{' '}
        first, then come back.
      </p>
    </Experiment>
  );
}

// Experiment 3: the URL of this very page.
function WhereAmI() {
  const [here, setHere] = useState(null);

  // window.location is the browser's own breakdown of the address bar.
  function readLocation() {
    const location = window.location;
    setHere({
      scheme: location.protocol,
      host: location.hostname,
      port: location.port ? ':' + location.port : '',
      path: location.pathname,
      query: location.search,
      fragment: location.hash,
    });
  }

  useEffect(() => {
    readLocation();
    // When the #fragment changes, read the address again.
    window.addEventListener('hashchange', readLocation);
    return () => window.removeEventListener('hashchange', readLocation);
  }, []);

  return (
    <Experiment title="🔬 Experiment 3: Where are you right now?">
      <p>This is the URL of <i>this very page</i>, taken apart by the browser:</p>
      {here && (
        <table className={TABLE}>
          <tbody>
            {PARTS.map((part) => (
              <tr key={part.key}>
                <td className={`${CELL} ${part.className}`}>{part.name}</td>
                <td className={`${CELL} font-mono`} data-testid={`here-${part.key}`}>
                  {partValue(here, part.key)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <button type="button" className={ui.smallButton} onClick={() => (window.location.hash = 'treasure')}>
        Add #treasure to the address
      </button>
      <p className="text-sm text-slate-500">
        Look at the address bar after pressing it! The page didn&apos;t reload. The{' '}
        <span className="font-bold text-rose-700">#fragment</span> stays inside your browser and is <b>never sent to the server</b>.
      </p>
    </Experiment>
  );
}

export default function UrlLab() {
  return (
    <>
      <p className="text-slate-700">
        A <b>URL</b> is a web address. It looks like one long jumble, but every piece has a job, just like a postal
        address has a town, a street and a house number. 🏠
      </p>

      <UrlExplorer />
      <TryUrls />
      <WhereAmI />

      <Experiment title="🧠 Quick quiz">
        <Quiz
          question="In http://localhost:3000/todos/5, what is the path?"
          options={[{ label: 'localhost' }, { label: '/todos/5', right: true }, { label: '3000' }]}
          rightText="Yes! The path says WHICH thing you want: todo number 5."
          wrongText="Not quite. Look for the part after the port that starts with a /"
        />
        <Quiz
          question="What does ?completed=true ask for?"
          options={[{ label: 'Only the finished todos', right: true }, { label: 'Delete the finished todos' }, { label: 'A different website' }]}
          rightText="Right! A query adds extra details, like a filter. Try it in Experiment 2."
          wrongText="Not quite. A query only adds details; it doesn't delete anything."
        />
        <Quiz
          question="Which part is NEVER sent to the server?"
          options={[{ label: 'The path' }, { label: 'The query' }, { label: 'The #fragment', right: true }]}
          rightText="Correct! The browser keeps the #fragment to itself. You proved it in Experiment 3."
          wrongText="Not that one. Hint: look at Experiment 3."
        />
      </Experiment>
    </>
  );
}
