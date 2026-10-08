// app/course/layout.js
// Every page under /course gets the course styles, on top of globals.css.
import './course.css';

export default function CourseLayout({ children }) {
  return children;
}
