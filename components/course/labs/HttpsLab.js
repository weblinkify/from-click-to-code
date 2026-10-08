'use client';
// components/course/labs/HttpsLab.js
// The hands-on lab for Lesson 6: HTTP and HTTPS. Postcards vs sealed envelopes.
// Shown in the course player at http://localhost:3000/course/https

import { useEffect, useRef, useState } from 'react';
import Experiment from '../Experiment.js';
import Quiz from '../Quiz.js';
import CodeLink from '../CodeLink.js';
import { sendRaw } from '../../../lib/course/send.js';
import ui from '../../../lib/ui.js';

// Table styles, used by every table in this lab.
const TABLE = 'w-full overflow-hidden rounded-xl border border-slate-200 bg-white text-left text-sm';
const CELL = 'border-b border-slate-100 px-3 py-2 align-top break-words';

// Turn bytes into letters we can show (a format called base64).
function bytesToText(bytes) {
  let binary = '';
  for (const byte of new Uint8Array(bytes)) {
    binary = binary + String.fromCharCode(byte);
  }
  return window.btoa(binary);
}

// Experiment 1: real AES encryption, right in the browser.
function PostcardOrEnvelope() {
  const [message, setMessage] = useState('my password is sunflower42');
  const [scrambled, setScrambled] = useState('');
  const [unlocked, setUnlocked] = useState('');
  const [canEncrypt, setCanEncrypt] = useState(true);
  // useRef remembers things that don't change what's on screen: the key
  // and the latest sealed envelope.
  const keyRef = useRef(null);
  const envelopeRef = useRef(null);

  // Seal the message in an "envelope" using real AES encryption.
  async function seal(text) {
    if (!keyRef.current) {
      return;
    }
    // An "IV" is a random starting point, so the same message never
    // scrambles the same way twice.
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const bytes = new TextEncoder().encode(text);
    const ciphertext = await window.crypto.subtle.encrypt({ name: 'AES-GCM', iv }, keyRef.current, bytes);
    envelopeRef.current = { iv, ciphertext };
    setScrambled(bytesToText(ciphertext));
    setUnlocked('');
  }

  // Use the key to turn the scrambled message back into words.
  async function unlock() {
    const envelope = envelopeRef.current;
    if (!envelope) {
      return;
    }
    const bytes = await window.crypto.subtle.decrypt({ name: 'AES-GCM', iv: envelope.iv }, keyRef.current, envelope.ciphertext);
    setUnlocked(new TextDecoder().decode(bytes));
  }

  // When the page opens, cut a brand-new secret key, like a key for a lock.
  useEffect(() => {
    // window.crypto.subtle is the browser's built-in encryption toolbox.
    // Browsers only allow it on "secure" pages (HTTPS, or localhost).
    if (!window.crypto || !window.crypto.subtle) {
      setCanEncrypt(false);
      return;
    }
    window.crypto.subtle
      .generateKey({ name: 'AES-GCM', length: 128 }, false, ['encrypt', 'decrypt'])
      .then((key) => {
        keyRef.current = key;
        seal('my password is sunflower42');
      });
  }, []);

  function onType(event) {
    setMessage(event.target.value);
    seal(event.target.value);
  }

  return (
    <Experiment title="🔬 Experiment 1: Postcard or envelope?">
      <p>Type a secret message, then see what a snoop on the café Wi-Fi would see.</p>
      <label htmlFor="secret-input" className={ui.label}>
        Your secret message
      </label>
      <input id="secret-input" className={ui.input} value={message} onChange={onType} maxLength={80} autoComplete="off" />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-4">
          <h3 className="font-extrabold">📮 HTTP (postcard)</h3>
          <p className="mt-2 text-sm text-slate-500">The snoop 👀 sees:</p>
          <p className="mt-1 font-bold break-words" data-testid="postcard-text">{message}</p>
        </div>
        <div className="rounded-xl border-2 border-emerald-300 bg-emerald-50 p-4">
          <h3 className="font-extrabold">🔒 HTTPS (sealed envelope)</h3>
          <p className="mt-2 text-sm text-slate-500">The snoop 👀 sees:</p>
          <p className="mt-1 font-mono text-xs break-all" data-testid="envelope-text">
            {canEncrypt ? scrambled : 'Encryption only works on secure pages. Open this page at http://localhost:3000.'}
          </p>
          <button type="button" className={`${ui.smallButton} mt-3`} onClick={unlock}>
            🔑 Unlock with the server&apos;s key
          </button>
          {unlocked && <p className="mt-2 font-bold break-words" data-testid="unlocked-text">🔓 {unlocked}</p>}
        </div>
      </div>
      <p className="text-sm text-slate-500">
        This is <b>real encryption</b> (called AES), done by your browser. Each time you type, a new scrambled message
        is made. Without the key it&apos;s just nonsense!
      </p>
    </Experiment>
  );
}

// Experiment 2: is this page using HTTPS?
function SecurityFacts() {
  const [facts, setFacts] = useState(null);

  useEffect(() => {
    const location = window.location;
    setFacts({
      scheme: location.protocol.replace(':', ''),
      usesHttps: location.protocol === 'https:',
      isLocalhost: ['localhost', '127.0.0.1'].includes(location.hostname),
      // isSecureContext: the browser's own opinion on whether this page is safe.
      isSecure: window.isSecureContext,
    });
  }, []);

  if (!facts) {
    return null;
  }

  let explanation;
  if (facts.usesHttps) {
    explanation = 'This page uses HTTPS. Everything between you and the server is in a sealed envelope. 🔒';
  } else if (facts.isLocalhost) {
    explanation =
      "No padlock here, and that's OK! On localhost the messages never leave your computer, so there's nobody in " +
      'the middle to snoop. On the real internet, our app would always use HTTPS.';
  } else {
    explanation = '⚠️ This page uses plain HTTP over a network. Anyone in the middle could read the postcards!';
  }

  return (
    <Experiment title="🔬 Experiment 2: Is this page using HTTPS?">
      <table className={TABLE}>
        <tbody>
          <tr>
            <td className={`${CELL} font-bold text-fuchsia-700`}>Scheme of this page</td>
            <td className={CELL}>{facts.scheme}</td>
          </tr>
          <tr>
            <td className={CELL}>Sealed envelope (HTTPS)?</td>
            <td className={CELL}>{facts.usesHttps ? 'Yes 🔒' : 'No 📮'}</td>
          </tr>
          <tr>
            <td className={CELL}>Messages leave this computer?</td>
            <td className={CELL}>{facts.isLocalhost ? 'No: localhost means "this computer"' : 'Yes'}</td>
          </tr>
          <tr>
            <td className={CELL}>Browser thinks it&apos;s safe?</td>
            <td className={CELL}>{facts.isSecure ? 'Yes ✅' : 'No ⚠️'}</td>
          </tr>
        </tbody>
      </table>
      <p>{explanation}</p>
    </Experiment>
  );
}

// Experiment 3: the HttpOnly wristband cookie.
function CookieCheck() {
  const [visible, setVisible] = useState(null);
  const [who, setWho] = useState(null);

  async function check() {
    // document.cookie lists the cookies JavaScript is ALLOWED to read.
    const names = document.cookie
      .split(';')
      .map((part) => part.trim().split('=')[0])
      .filter((name) => name !== '');
    setVisible(names);
    // Ask the server "who am I?". The browser sends the hidden sid cookie along.
    const answer = await sendRaw('GET', '/auth/me');
    setWho(answer.status === 200 ? answer.data.user.username : null);
  }

  return (
    <Experiment title="🔬 Experiment 3: The secret wristband cookie">
      <p>
        When you log in, the server gives your browser a <b>cookie</b> named <code className={ui.inlineCode}>sid</code>. That&apos;s your
        &quot;wristband&quot;. It&apos;s marked <b>HttpOnly</b>, which means JavaScript on the page is{' '}
        <b>not allowed to read it</b>, so a sneaky script can&apos;t steal it.
      </p>
      <button type="button" className={ui.smallButton} onClick={check}>
        Look for cookies
      </button>
      {visible && (
        <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p>
            <b>Cookies this page&apos;s JavaScript can see:</b>
          </p>
          <pre className={ui.codeBlock} data-testid="visible-cookies">{visible.length > 0 ? visible.join('\n') : '(none)'}</pre>
          <p>
            <b>Does the server still know who you are?</b>
          </p>
          <pre className={ui.codeBlock} data-testid="who-am-i">{who ? `Yes! You are logged in as "${who}".` : 'No, you are not logged in.'}</pre>
          <p className="text-sm text-slate-600">
            {who
              ? '"sid" is NOT in the list, but the server still knows who you are. The browser sends the HttpOnly cookie to the server, but keeps it hidden from JavaScript. 🛡️'
              : 'Log in first (open the app in another tab), then press the button again.'}
          </p>
        </div>
      )}
      <CodeLink path="lib/sessions.js">See the cookie settings in lib/sessions.js</CodeLink>
    </Experiment>
  );
}

// The security headers we look for, and what each one means.
const HEADER_INFO = [
  ['content-security-policy', 'Only run scripts from our own site that carry today\'s secret "nonce".'],
  ['x-frame-options', "Don't let other websites show us inside a frame (stops trick clicks)."],
  ['x-content-type-options', "Don't guess what kind of file this is; trust what we say."],
  ['referrer-policy', "Don't tell other sites which page you came from."],
  ['cross-origin-opener-policy', 'Keep our page separate from pages opened by other sites.'],
  ['strict-transport-security', 'Always use HTTPS from now on. (Only sent when the site really has HTTPS.)'],
];

// Experiment 4: read the safety headers on a real answer.
function HeaderCheck() {
  const [headers, setHeaders] = useState(null);

  async function check() {
    // Ask for this page again, so we can read the headers on the answer.
    const answer = await sendRaw('GET', window.location.pathname);
    setHeaders(HEADER_INFO.map(([name, meaning]) => ({ name, meaning, value: answer.headers ? answer.headers.get(name) : null })));
  }

  return (
    <Experiment title="🔬 Experiment 4: Safety instructions from the server">
      <p>
        With every answer, our server sends <b>security headers</b>: extra instructions telling the browser to be
        careful. Let&apos;s read them!
      </p>
      <button type="button" className={ui.smallButton} onClick={check}>
        Read the headers
      </button>
      {headers && (
        <table className={TABLE}>
          <tbody>
            {headers.map((header) => (
              <tr key={header.name}>
                <td className={`${CELL} font-mono text-xs`}>{header.name}</td>
                <td className={`${CELL} font-mono text-xs break-all`}>{header.value || '(not sent)'}</td>
                <td className={CELL}>{header.meaning}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <CodeLink path="proxy.js">See where the headers come from: proxy.js</CodeLink>
    </Experiment>
  );
}

export default function HttpsLab() {
  return (
    <>
      <p className="text-slate-700">
        <b>HTTP</b> is the language browsers and servers use to talk. <b>HTTPS</b> is the same language with an{' '}
        <b>S for Secure</b>: every message is <b>encrypted</b> (scrambled) so nobody in the middle can read it.
      </p>
      <p className="text-slate-700">
        HTTP is like a <b>postcard</b> 📮: anyone who handles it can read it. HTTPS is like a{' '}
        <b>sealed, locked envelope</b> 🔒: only the real server has the key.
      </p>

      <PostcardOrEnvelope />
      <SecurityFacts />
      <CookieCheck />
      <HeaderCheck />

      <Experiment title="🧠 Quick quiz">
        <Quiz
          question="You're on café Wi-Fi. Which is safer for typing a password?"
          options={[{ label: 'http://' }, { label: 'https://', right: true }]}
          rightText="Yes! HTTPS seals your password in a locked envelope."
          wrongText="Careful! http:// is a postcard. Anyone on the Wi-Fi could read it."
        />
        <Quiz
          question="What does the 🔒 padlock in the address bar tell you?"
          options={[
            { label: 'The connection is encrypted and the site showed a valid ID card (certificate)', right: true },
            { label: 'The website is always nice and safe' },
          ]}
          rightText="Exactly! The envelope is sealed, but you still need to decide whether you trust the site itself."
          wrongText="Not quite. A padlock only means the connection is private. A sneaky site can have a padlock too!"
        />
        <Quiz
          question="Why couldn't JavaScript see the sid cookie in Experiment 3?"
          options={[{ label: 'It was deleted' }, { label: "It's marked HttpOnly", right: true }]}
          rightText="Right! HttpOnly hides the wristband from scripts, but the browser still sends it to the server."
          wrongText="It's still there: the server knew who you were! Something is hiding it from JavaScript..."
        />
      </Experiment>

    </>
  );
}
