// components/course/AnswerBox.js
// Shows what the server answered: the address, the status code (with a
// kid-friendly meaning), and the words it sent back.

import { explainStatus } from '../../lib/course/status-codes.js';
import ui from '../../lib/ui.js';

// Green for 2xx, amber for 4xx, red for 5xx (and grey for no answer).
function statusColour(status) {
  if (status >= 200 && status < 300) {
    return 'bg-emerald-100 text-emerald-800';
  }
  if (status >= 400 && status < 500) {
    return 'bg-amber-100 text-amber-800';
  }
  if (status >= 500) {
    return 'bg-rose-100 text-rose-800';
  }
  return 'bg-slate-200 text-slate-700';
}

export default function AnswerBox({ answer }) {
  if (!answer) {
    return (
      <div className="rounded-xl border-2 border-dashed border-slate-200 p-4 text-slate-500">
        Press a button to send a request. The answer appears here.
      </div>
    );
  }

  return (
    <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4" aria-live="polite">
      <p>
        <b>You asked:</b>{' '}
        <code className={ui.inlineCode}>
          {answer.method} {answer.url}
        </code>
      </p>
      <p className="flex flex-wrap items-center gap-2">
        <b>Status code:</b>
        <span className={`status-code rounded-md px-2 py-0.5 font-mono font-bold ${statusColour(answer.status)}`}>
          {answer.status}
        </span>
        <span>{explainStatus(answer.status)}</span>
      </p>
      {answer.requestId && (
        <p>
          <b>Request ID:</b> <code className={ui.inlineCode}>{answer.requestId}</code>
        </p>
      )}
      <pre className={ui.codeBlock}>{answer.bodyText}</pre>
    </div>
  );
}
