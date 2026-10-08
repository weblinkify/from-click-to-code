// scripts/check-links.js
// Checks that every link in our Markdown files (lessons, bad examples,
// README) points to a file or folder that really exists.
// Run it with: npm run check:links

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.join(import.meta.dirname, '..');
const FOLDERS_TO_CHECK = ['lessons', 'bad-examples'];
const FILES_TO_CHECK = ['README.md', 'CLAUDE.md'];

// Finds [text](target) and href="target" links.
const LINK_PATTERN = /\]\(([^)\s]+)\)|href="([^"]+)"/g;

function markdownFiles() {
  const files = FILES_TO_CHECK.map((file) => path.join(ROOT, file));
  for (const folder of FOLDERS_TO_CHECK) {
    for (const name of fs.readdirSync(path.join(ROOT, folder))) {
      if (name.endsWith('.md')) {
        files.push(path.join(ROOT, folder, name));
      }
    }
  }
  return files;
}

function isExternal(target) {
  return /^(https?:|mailto:|#)/.test(target);
}

function brokenLinksIn(file) {
  const text = fs.readFileSync(file, 'utf8');
  const broken = [];
  for (const match of text.matchAll(LINK_PATTERN)) {
    const target = match[1] || match[2];
    if (isExternal(target)) {
      continue;
    }
    const withoutAnchor = target.split('#')[0];
    const resolved = path.resolve(path.dirname(file), withoutAnchor);
    if (!fs.existsSync(resolved)) {
      broken.push(target);
    }
  }
  return broken;
}

let brokenCount = 0;
let fileCount = 0;
for (const file of markdownFiles()) {
  fileCount = fileCount + 1;
  for (const target of brokenLinksIn(file)) {
    brokenCount = brokenCount + 1;
    console.log(`❌ ${path.relative(ROOT, file)} -> ${target}`);
  }
}

if (brokenCount > 0) {
  console.log(`\n${brokenCount} broken link(s) found.`);
  process.exit(1);
}
console.log(`✅ All links in ${fileCount} Markdown files point to real files.`);
