// app/layout.js
// The "frame" around every page: the <html> and <body> tags.
// (Pages arrive in the next step of the project.)

export const metadata = {
  title: 'Kids Todo App',
  description: 'A small, real web app for learning how websites work.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
