// components/course/Experiment.js
// A dashed box around one hands-on experiment.

export default function Experiment({ title, children, variant }) {
  const className = variant ? `experiment ${variant}` : 'experiment';
  return (
    <section className={className}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}
