// lib/ui.js
// Tailwind class lists we use again and again, given friendly names,
// so every button and box in the app looks the same.
//
// Reading a Tailwind class list, left to right:
//   rounded-lg   -> rounded corners
//   bg-blue-600  -> blue background (100 = very light ... 900 = very dark)
//   px-4 py-2    -> padding left/right (x) and top/bottom (y)
//   font-bold    -> bold text
//   hover:...    -> only when the mouse is over it
//   disabled:... -> only when the button is switched off

const ui = {
  // The main, most important button on a screen.
  primaryButton:
    'inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60',
  // A quieter button, for less important actions.
  secondaryButton:
    'inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 font-bold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50',
  // A small button (e.g. inside an experiment).
  smallButton:
    'inline-flex items-center justify-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-60',
  smallSecondaryButton:
    'inline-flex items-center justify-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50',
  // A text box.
  input:
    'w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-3 focus:ring-blue-100',
  label: 'mb-1 mt-4 block text-sm font-bold text-slate-700',
  // A white card with a soft border and shadow.
  card: 'rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8',
  // A link inside text.
  link: 'font-semibold text-blue-700 underline decoration-blue-300 underline-offset-2 hover:decoration-blue-700',
  // Small code, like `/todos`.
  inlineCode: 'rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.9em] text-slate-800',
  // A dark box for bigger blocks of code or answers from the server.
  codeBlock: 'overflow-x-auto rounded-xl bg-slate-900 p-4 font-mono text-sm leading-relaxed text-slate-100',
};

export default ui;
