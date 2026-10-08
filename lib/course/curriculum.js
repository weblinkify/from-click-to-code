// lib/course/curriculum.js
// The whole course: sections, and the lessons in each one, in order.
// The course landing page, the lesson player and the sidebar are all
// built from this one list, so it's the only place to change.
//
// Each lesson:
//   slug     -> its address: /course/<slug>
//   number   -> its lesson number
//   file     -> the written lesson in the lessons/ folder
//   minutes  -> about how long it takes
//   lab      -> (only for hands-on lessons) which interactive lab to show

const COURSE = {
  title: 'How the Web Works: From Click to Code',
  subtitle:
    'Build a real todo app with your grown-up and discover what happens behind every click: URLs, HTTPS, APIs, databases, security, testing and the cloud.',
  audience: 'For curious kids aged 9–13 and their grown-ups',
};

const SECTIONS = [
  {
    title: 'Getting started',
    lessons: [
      { slug: 'the-idea', number: 1, emoji: '💡', title: 'The idea', file: '01-the-idea.md', minutes: 8 },
      { slug: 'requirements', number: 2, emoji: '📋', title: 'Requirements: what does "done" mean?', file: '02-requirements.md', minutes: 10 },
      { slug: 'ui', number: 3, emoji: '🎨', title: 'The UI: drawing before building', file: '03-ui.md', minutes: 12 },
    ],
  },
  {
    title: 'How the web works',
    lessons: [
      { slug: 'what-happens-when-you-click', number: 4, emoji: '🖱️', title: 'What happens when you click a link?', file: '04-what-happens-when-you-click.md', minutes: 12 },
      { slug: 'url', number: 5, emoji: '🔗', title: 'The parts of a URL', file: '05-url-parts.md', minutes: 20, lab: 'url' },
      { slug: 'https', number: 6, emoji: '🔒', title: 'HTTP and HTTPS', file: '06-http-vs-https.md', minutes: 20, lab: 'https' },
    ],
  },
  {
    title: 'Logging in and staying safe',
    lessons: [
      { slug: 'login', number: 7, emoji: '🎟️', title: 'Logging in: passwords, hashes and wristbands', file: '07-login.md', minutes: 15 },
      { slug: 'security', number: 8, emoji: '🔐', title: 'Security: locks on every door', file: '08-security.md', minutes: 15 },
    ],
  },
  {
    title: 'Building the app',
    lessons: [
      { slug: 'frontend-backend', number: 9, emoji: '🍽️', title: 'Frontend and backend', file: '09-frontend-backend.md', minutes: 12 },
      { slug: 'api', number: 10, emoji: '📜', title: 'APIs: talk to the kitchen', file: '10-apis.md', minutes: 20, lab: 'api' },
      { slug: 'database', number: 11, emoji: '🗄️', title: "The database: the app's filing cabinet", file: '11-database.md', minutes: 15 },
      { slug: 'writing-code', number: 12, emoji: '✏️', title: 'Writing code: small pieces, good names', file: '12-writing-code.md', minutes: 10 },
    ],
  },
  {
    title: 'Checking our work',
    lessons: [
      { slug: 'testing', number: 13, emoji: '🧪', title: 'Testing: checking our work automatically', file: '13-testing.md', minutes: 12 },
      { slug: 'code-review', number: 14, emoji: '🕵️', title: 'Code review: spot the bug', file: '14-code-review.md', minutes: 20, lab: 'code-review' },
      { slug: 'security-review', number: 15, emoji: '🛡️', title: 'Security review: the attack lab', file: '15-security-review.md', minutes: 20, lab: 'security' },
    ],
  },
  {
    title: 'Shipping it',
    lessons: [
      { slug: 'git', number: 16, emoji: '🌳', title: 'Git and pull requests', file: '16-git-and-pull-requests.md', minutes: 15 },
      { slug: 'ci-cd', number: 17, emoji: '🤖', title: 'CI/CD: the robot that checks every change', file: '17-ci-cd.md', minutes: 10 },
      { slug: 'cloud', number: 18, emoji: '☁️', title: 'Cloud and servers', file: '18-cloud-and-servers.md', minutes: 12 },
    ],
  },
  {
    title: 'Running it for real',
    lessons: [
      { slug: 'after-deployment', number: 19, emoji: '📊', title: 'After deployment: watching the dashboard', file: '19-after-deployment.md', minutes: 10 },
      { slug: 'incident', number: 20, emoji: '🚨', title: 'Incident drill: the control room', file: '20-incident-drill.md', minutes: 25, lab: 'incident' },
      { slug: 'improvement', number: 21, emoji: '🌱', title: 'Continuous improvement', file: '21-continuous-improvement.md', minutes: 10 },
      { slug: 'big-picture', number: 22, emoji: '🗺️', title: 'The big picture', file: '22-big-picture.md', minutes: 10 },
      { slug: 'plain-to-react', number: 23, emoji: '🔁', title: 'Bonus: from plain JavaScript to React', file: '23-from-plain-to-react.md', minutes: 12 },
    ],
  },
];

// Every lesson in one flat list, each one knowing its section number.
const LESSONS = SECTIONS.flatMap((section, sectionIndex) =>
  section.lessons.map((lesson) => ({ ...lesson, sectionNumber: sectionIndex + 1, sectionTitle: section.title }))
);

const TOTAL_MINUTES = LESSONS.reduce((total, lesson) => total + lesson.minutes, 0);
const LAB_COUNT = LESSONS.filter((lesson) => lesson.lab).length;

function findLesson(slug) {
  return LESSONS.find((lesson) => lesson.slug === slug) || null;
}

function findLessonByFile(file) {
  return LESSONS.find((lesson) => lesson.file === file) || null;
}

function neighbours(slug) {
  const index = LESSONS.findIndex((lesson) => lesson.slug === slug);
  return {
    previous: index > 0 ? LESSONS[index - 1] : null,
    next: index >= 0 && index < LESSONS.length - 1 ? LESSONS[index + 1] : null,
  };
}

// "1 h 45 min" or "40 min"
function formatMinutes(minutes) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) {
    return `${rest} min`;
  }
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}

// A link to a file in this project on GitHub.
const REPO_URL = 'https://github.com/weblinkify/from-click-to-code/blob/main';
function codeLink(path) {
  return `${REPO_URL}/${path}`;
}

export { COURSE, SECTIONS, LESSONS, TOTAL_MINUTES, LAB_COUNT, findLesson, findLessonByFile, neighbours, formatMinutes, codeLink };
