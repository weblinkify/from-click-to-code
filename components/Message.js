// components/Message.js
// A short message under a form: red for problems, green for good news.
//
// Props are the "settings" a component is given, like the label on a jar:
//   text   -> the words to show
//   isGood -> true makes it green

export default function Message({ text, isGood }) {
  const colour = isGood ? 'text-emerald-700' : 'text-rose-700';
  // React shows {text} as plain letters, never as code. Safe!
  return (
    <p className={`message min-h-6 py-2 font-bold ${colour}`} role="status">
      {text}
    </p>
  );
}
