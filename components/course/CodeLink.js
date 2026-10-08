// components/course/CodeLink.js
// A small "see the real code" link to a file in this project on GitHub.

import { codeLink } from '../../lib/course/curriculum.js';

export default function CodeLink({ path, children }) {
  return (
    <a
      className="code-link inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:underline"
      href={codeLink(path)}
      target="_blank"
      rel="noopener noreferrer"
    >
      👀 {children || path}
    </a>
  );
}
