// components/Message.js
// A short message under a form: red for problems, green for good news.
//
// Props are the "settings" a component is given, like the label on a jar:
//   text   -> the words to show
//   isGood -> true makes it green

export default function Message({ text, isGood }) {
  const className = isGood ? 'message is-good' : 'message';
  // React shows {text} as plain letters, never as code. Safe!
  return (
    <p className={className} role="status">
      {text}
    </p>
  );
}
