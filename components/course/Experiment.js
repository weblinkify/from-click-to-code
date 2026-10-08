// components/course/Experiment.js
// A box around one hands-on experiment.
//   variant="challenge" -> a blue "mini challenge" box

export default function Experiment({ title, children, variant }) {
  const colours =
    variant === 'challenge'
      ? 'border-blue-200 bg-blue-50'
      : 'border-slate-200 bg-white';
  return (
    <section className={`experiment my-6 rounded-2xl border p-5 shadow-sm sm:p-6 ${colours}`}>
      <h2 className="mb-3 text-xl font-extrabold text-slate-900">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
