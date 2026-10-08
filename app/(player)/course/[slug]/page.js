// app/(player)/course/[slug]/page.js  ->  http://localhost:3000/course/url (and every lesson)
// The folder [slug] means "any lesson name goes here". This page runs on
// the SERVER: it reads the written lesson from the lessons/ folder, picks
// the hands-on lab (if the lesson has one), and hands both to the player.

import fs from 'node:fs/promises';
import path from 'node:path';
import { notFound } from 'next/navigation';
import CoursePlayer from '../../../../components/course/CoursePlayer.js';
import LessonReading from '../../../../components/course/LessonReading.js';
import UrlLab from '../../../../components/course/labs/UrlLab.js';
import HttpsLab from '../../../../components/course/labs/HttpsLab.js';
import ApiLab from '../../../../components/course/labs/ApiLab.js';
import CodeReviewLab from '../../../../components/course/labs/CodeReviewLab.js';
import SecurityLab from '../../../../components/course/labs/SecurityLab.js';
import IncidentLab from '../../../../components/course/labs/IncidentLab.js';
import { findLesson } from '../../../../lib/course/curriculum.js';

// Which lab goes with which lesson (see "lab" in lib/course/curriculum.js).
const LABS = {
  url: UrlLab,
  https: HttpsLab,
  api: ApiLab,
  'code-review': CodeReviewLab,
  security: SecurityLab,
  incident: IncidentLab,
};

// The words in the browser tab, e.g. "5. The parts of a URL · Kids Todo App".
export async function generateMetadata({ params }) {
  const lesson = findLesson((await params).slug);
  return { title: lesson ? `${lesson.number}. ${lesson.title}` : 'Lesson not found' };
}

export default async function LessonPage({ params }) {
  const { slug } = await params;
  const lesson = findLesson(slug);
  // No lesson with that name? Show the friendly 404 page.
  if (!lesson) {
    notFound();
  }

  // Read the written lesson. (process.cwd() is the project's main folder.)
  const markdown = await fs.readFile(path.join(process.cwd(), 'lessons', lesson.file), 'utf8');
  const Lab = lesson.lab ? LABS[lesson.lab] : null;

  return <CoursePlayer slug={slug} lab={Lab ? <Lab /> : null} reading={<LessonReading markdown={markdown} />} />;
}
