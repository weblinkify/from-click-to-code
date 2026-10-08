// lib/course/lessons.js
// The list of interactive lessons in the in-app course, in order.
// The course home page and the "next lesson" links are built from this list.

const REPO_URL = 'https://github.com/weblinkify/from-click-to-code/blob/main';

const LESSONS = [
  {
    id: 'url',
    number: 5,
    emoji: '🔗',
    title: 'The parts of a URL',
    blurb: 'Read a web address like a postal address.',
    markdown: 'lessons/05-url-parts.md',
  },
  {
    id: 'https',
    number: 6,
    emoji: '🔒',
    title: 'HTTP and HTTPS',
    blurb: 'Postcards vs sealed envelopes, with real encryption.',
    markdown: 'lessons/06-http-vs-https.md',
  },
  {
    id: 'api',
    number: 10,
    emoji: '📜',
    title: 'Talk to the API',
    blurb: 'Send your own requests and read the answers.',
    markdown: 'lessons/10-apis.md',
  },
  {
    id: 'code-review',
    number: 14,
    emoji: '🕵️',
    title: 'Spot the bug',
    blurb: 'A code review game: find the mistake in real code.',
    markdown: 'lessons/14-code-review.md',
  },
  {
    id: 'security',
    number: 15,
    emoji: '🛡️',
    title: 'The security lab',
    blurb: 'Try the sneaky tricks safely and watch the defences work.',
    markdown: 'lessons/15-security-review.md',
  },
  {
    id: 'incident',
    number: 20,
    emoji: '🚨',
    title: 'The incident control room',
    blurb: 'Watch the app\'s pulse and practise fixing an outage.',
    markdown: 'lessons/20-incident-drill.md',
  },
];

// A link to a file in this project on GitHub.
function codeLink(path) {
  return `${REPO_URL}/${path}`;
}

function findLesson(id) {
  return LESSONS.find((lesson) => lesson.id === id);
}

function nextLesson(id) {
  const index = LESSONS.findIndex((lesson) => lesson.id === id);
  return LESSONS[index + 1] || null;
}

function previousLesson(id) {
  const index = LESSONS.findIndex((lesson) => lesson.id === id);
  return index > 0 ? LESSONS[index - 1] : null;
}

export { LESSONS, codeLink, findLesson, nextLesson, previousLesson };
