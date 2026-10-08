// app/course/page.js: the course home. (The lessons arrive in the next step.)
import Link from 'next/link';

export default function CourseHome() {
  return (
    <main className="card">
      <h1>📚 How the web works</h1>
      <p>The interactive lessons are on their way!</p>
      <p>
        <Link href="/">← Back to the app</Link>
      </p>
    </main>
  );
}
