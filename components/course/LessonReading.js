// components/course/LessonReading.js
// Shows a written lesson (Markdown) as a nicely styled page.
// It runs on the SERVER: the browser gets finished HTML.
//
// react-markdown turns Markdown into React elements. remark-gfm adds
// "GitHub-flavoured" extras, like tables and [ ] checklists.
// We tell it how each kind of element should look, using Tailwind.

import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import RevealAnswer from './RevealAnswer.js';
import { splitLesson } from '../../lib/course/markdown.js';
import { findLessonByFile, codeLink } from '../../lib/course/curriculum.js';
import ui from '../../lib/ui.js';

// Work out where a link in a lesson should really go.
function resolveLink(href) {
  if (/^(https?:|mailto:|#)/.test(href)) {
    return { href, external: !href.startsWith('#') };
  }
  const [path, anchor] = href.split('#');
  // Another lesson, e.g. "05-url-parts.md" -> /course/url
  const lesson = findLessonByFile(path);
  if (lesson) {
    return { href: `/course/${lesson.slug}${anchor ? '#' + anchor : ''}`, external: false };
  }
  if (path === 'README.md') {
    return { href: '/course', external: false };
  }
  // A file in the project, e.g. "../lib/csrf.js" -> GitHub
  const projectPath = path.startsWith('../') ? path.slice(3) : `lessons/${path}`;
  return { href: codeLink(projectPath), external: true };
}

// Links look blue, even when they hold `code`.
const LINK_STYLE = `${ui.link} [&_code]:text-blue-700`;

function LessonLink({ href, children }) {
  const target = resolveLink(href || '');
  if (target.external) {
    return (
      <a href={target.href} target="_blank" rel="noopener noreferrer" className={LINK_STYLE}>
        {children}
      </a>
    );
  }
  return (
    <Link href={target.href} className={LINK_STYLE}>
      {children}
    </Link>
  );
}

// How each Markdown element looks.
const COMPONENTS = {
  h2: ({ children }) => <h2 className="mb-3 mt-10 text-2xl font-extrabold text-slate-900">{children}</h2>,
  h3: ({ children }) => <h3 className="mb-2 mt-6 text-xl font-bold text-slate-900">{children}</h3>,
  p: ({ children }) => <p className="my-3 leading-relaxed text-slate-700">{children}</p>,
  ul: ({ children }) => <ul className="my-3 list-disc space-y-1.5 pl-6 text-slate-700">{children}</ul>,
  ol: ({ children, start }) => (
    <ol start={start} className="my-3 list-decimal space-y-1.5 pl-6 text-slate-700">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  a: LessonLink,
  strong: ({ children }) => <strong className="font-bold text-slate-900">{children}</strong>,
  blockquote: ({ children }) => (
    <blockquote className="my-4 rounded-r-xl border-l-4 border-blue-400 bg-blue-50 px-4 py-1">{children}</blockquote>
  ),
  hr: () => <hr className="my-8 border-slate-200" />,
  // Code inside a <pre> block gets the dark look; small `code` gets the light one.
  pre: ({ children }) => (
    <pre className={`${ui.codeBlock} my-4 [&_code]:bg-transparent [&_code]:p-0 [&_code]:text-slate-100`}>{children}</pre>
  ),
  code: ({ children }) => <code className={ui.inlineCode}>{children}</code>,
  table: ({ children }) => (
    <div className="my-4 overflow-x-auto rounded-xl border border-slate-200">
      <table className="min-w-full text-left text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-slate-50 text-slate-900">{children}</thead>,
  th: ({ children }) => <th className="border-b border-slate-200 px-3 py-2 font-bold">{children}</th>,
  td: ({ children }) => <td className="border-b border-slate-100 px-3 py-2 align-top text-slate-700">{children}</td>,
};

function MarkdownPiece({ text }) {
  return (
    <Markdown remarkPlugins={[remarkGfm]} components={COMPONENTS}>
      {text}
    </Markdown>
  );
}

export default function LessonReading({ markdown }) {
  const pieces = splitLesson(markdown);
  return (
    <article className="lesson-reading">
      {pieces.map((piece, index) =>
        piece.type === 'answer' ? (
          <RevealAnswer key={index} label={piece.label}>
            <MarkdownPiece text={piece.text} />
          </RevealAnswer>
        ) : (
          <MarkdownPiece key={index} text={piece.text} />
        )
      )}
    </article>
  );
}
