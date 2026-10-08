// The course player tidies up each written lesson before showing it.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { splitLesson, htmlToMarkdown } from '../../lib/course/markdown.js';
import { LESSONS } from '../../lib/course/curriculum.js';

const LESSON_DIR = path.join(import.meta.dirname, '../../lessons');

describe('getting a written lesson ready for the course player', () => {
  it('turns hidden answers into "click to reveal" pieces', () => {
    const pieces = splitLesson('# Title\n\n1. Why?\n   <details><summary>Answer</summary>\n   Because <b>reasons</b>.\n   </details>\n');
    assert.deepEqual(pieces.map((piece) => piece.type), ['markdown', 'answer']);
    assert.equal(pieces[1].text, 'Because **reasons**.');
  });

  it('drops the big title and the navigation links at the bottom', () => {
    const pieces = splitLesson('# Lesson 1\n\nHello!\n\n---\n[← Lesson 0](00-x.md) · Next: [Lesson 2 →](02-y.md)\n');
    assert.equal(pieces.length, 1);
    assert.equal(pieces[0].text.trim(), 'Hello!');
  });

  it('turns the little bits of HTML into Markdown, never raw HTML', () => {
    assert.equal(htmlToMarkdown('<code>x</code> <i>y</i> <a href="z.md">z</a>'), '`x` *y* [z](z.md)');
  });

  it('every lesson in the course has a file, and no raw <details> is left over', () => {
    for (const lesson of LESSONS) {
      const markdown = fs.readFileSync(path.join(LESSON_DIR, lesson.file), 'utf8');
      const leftovers = splitLesson(markdown)
        .map((piece) => piece.text)
        .join('\n');
      assert.equal(leftovers.includes('<details>'), false, `${lesson.file} still has a <details>`);
      assert.equal(leftovers.includes('<summary>'), false, `${lesson.file} still has a <summary>`);
    }
  });
});
