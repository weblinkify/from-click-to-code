// components/course/CodeLink.js
// A small "see the real code" link to a file in this project on GitHub.

import { codeLink } from '../../lib/course/lessons.js';

export default function CodeLink({ path, children }) {
  return (
    <a className="code-link" href={codeLink(path)} target="_blank" rel="noopener noreferrer">
      👀 {children || path}
    </a>
  );
}
