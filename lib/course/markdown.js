// lib/course/markdown.js
// Gets a written lesson (a Markdown file from lessons/) ready to show
// inside the course player.
//
// Markdown is a simple way to write formatted text:  # Title,  **bold**,
// `code`,  - lists.  The lessons are written in it so they also look nice
// on GitHub.
//
// We tidy each lesson before showing it:
//   1. drop the big "# Title" (the player already shows the title)
//   2. drop the "Prefer clicking?" note (you're already in the app!)
//   3. drop the "← Lesson 4 · Next: Lesson 6 →" links at the bottom
//      (the player has its own buttons)
//   4. cut out every <details> answer, so the player can show it as a
//      "click to reveal" box
//
// SAFETY: we never put raw HTML from a file onto the page. The few HTML
// tags our lessons use (<code>, <b>, <i>, <a>) are turned into Markdown first.

// Turn the small bits of HTML in our lessons into Markdown.
function htmlToMarkdown(text) {
  return text
    .replace(/<code>(.*?)<\/code>/g, '`$1`')
    .replace(/<b>(.*?)<\/b>/g, '**$1**')
    .replace(/<i>(.*?)<\/i>/g, '*$1*')
    .replace(/<a href="([^"]+)">(.*?)<\/a>/g, '[$2]($1)');
}

// Remove the spaces that every line starts with (answers are indented).
function dedent(text) {
  const lines = text.split('\n');
  const indents = lines.filter((line) => line.trim() !== '').map((line) => line.match(/^ */)[0].length);
  const smallest = indents.length > 0 ? Math.min(...indents) : 0;
  return lines.map((line) => line.slice(smallest)).join('\n').trim();
}

function tidyLesson(markdown) {
  let text = markdown.replace(/\r\n/g, '\n');
  // 1. the first "# Title" line
  text = text.replace(/^# .*\n+/, '');
  // 2. the "Prefer clicking to reading?" note
  text = text.replace(/^> 🖥️ \*\*Prefer clicking.*\n+/m, '');
  // 3. the navigation links after the last "---"
  const lastRule = text.lastIndexOf('\n---\n');
  if (lastRule !== -1 && /\]\([^)]*\.md\)/.test(text.slice(lastRule))) {
    text = text.slice(0, lastRule);
  }
  return text.trim();
}

// Split a lesson into pieces: plain Markdown, and hidden answers.
//   [{ type: 'markdown', text }, { type: 'answer', label, text }, ...]
function splitLesson(markdown) {
  const text = tidyLesson(markdown);
  const pieces = [];
  const answerPattern = /<details>\s*<summary>(.*?)<\/summary>([\s\S]*?)<\/details>/g;
  let lastEnd = 0;

  for (const match of text.matchAll(answerPattern)) {
    pieces.push({ type: 'markdown', text: htmlToMarkdown(text.slice(lastEnd, match.index)) });
    pieces.push({ type: 'answer', label: match[1].trim(), text: htmlToMarkdown(dedent(match[2])) });
    lastEnd = match.index + match[0].length;
  }
  pieces.push({ type: 'markdown', text: htmlToMarkdown(text.slice(lastEnd)) });

  return pieces.filter((piece) => piece.text.trim() !== '');
}

export { splitLesson, tidyLesson, htmlToMarkdown };
