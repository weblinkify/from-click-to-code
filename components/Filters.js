'use client';
// components/Filters.js
// The "All / To do / Done" buttons.
// Each one changes the ?completed= part of the URL we ask for.

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'false', label: 'To do' },
  { value: 'true', label: 'Done' },
];

export default function Filters({ current, onChange }) {
  return (
    <nav className="flex gap-1 rounded-xl bg-slate-100 p-1" aria-label="Show which todos">
      {FILTERS.map((filter) => (
        <button
          // "key" helps React keep track of each button in a list.
          key={filter.value}
          type="button"
          // Light up the button that's picked.
          className={
            filter.value === current
              ? 'rounded-lg bg-white px-4 py-1.5 text-sm font-bold text-slate-900 shadow-sm'
              : 'rounded-lg px-4 py-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900'
          }
          aria-pressed={filter.value === current}
          onClick={() => onChange(filter.value)}
        >
          {filter.label}
        </button>
      ))}
    </nav>
  );
}
