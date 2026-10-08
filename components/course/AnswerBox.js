// components/course/AnswerBox.js
// Shows what the server answered: the address, the status code (with a
// kid-friendly meaning), and the words it sent back.

import { explainStatus } from '../../lib/course/status-codes.js';

export default function AnswerBox({ answer }) {
  if (!answer) {
    return (
      <div className="answer-box">
        <p className="muted">Press a button to send a request. The answer appears here.</p>
      </div>
    );
  }

  return (
    <div className="answer-box" aria-live="polite">
      <p>
        <b>You asked:</b> <code>{answer.method} {answer.url}</code>
      </p>
      <p>
        <b>Status code:</b> <span className="status-code">{answer.status}</span> {explainStatus(answer.status)}
      </p>
      {answer.requestId && (
        <p>
          <b>Request ID:</b> <code>{answer.requestId}</code>
        </p>
      )}
      <pre>{answer.bodyText}</pre>
    </div>
  );
}
