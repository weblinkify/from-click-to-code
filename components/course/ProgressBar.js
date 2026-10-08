// components/course/ProgressBar.js
// A bar that fills up as you finish lessons.
//   done / total -> how many lessons are finished, out of how many
//   dark        -> use light colours, for the dark top bar

export default function ProgressBar({ done, total, dark }) {
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  return (
    <div className="w-full">
      <div className={`flex justify-between text-xs font-bold ${dark ? 'text-slate-300' : 'text-slate-600'}`}>
        <span data-testid="progress-text">
          {done} of {total} lessons complete
        </span>
        <span>{percent}%</span>
      </div>
      <div
        className={`mt-1 h-2 overflow-hidden rounded-full ${dark ? 'bg-slate-700' : 'bg-slate-200'}`}
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Course progress"
      >
        {/* The filled part. Its width is set with a Tailwind "arbitrary value"
            class; see widthClass below. */}
        <div className={`h-full rounded-full bg-emerald-500 transition-all ${widthClass(percent)}`} />
      </div>
    </div>
  );
}

// Our Content-Security-Policy blocks inline style="width: 40%", so we pick
// a ready-made Tailwind width class instead (rounded to the nearest 5%).
const WIDTHS = {
  0: 'w-0', 5: 'w-[5%]', 10: 'w-[10%]', 15: 'w-[15%]', 20: 'w-[20%]', 25: 'w-[25%]', 30: 'w-[30%]',
  35: 'w-[35%]', 40: 'w-[40%]', 45: 'w-[45%]', 50: 'w-[50%]', 55: 'w-[55%]', 60: 'w-[60%]', 65: 'w-[65%]',
  70: 'w-[70%]', 75: 'w-[75%]', 80: 'w-[80%]', 85: 'w-[85%]', 90: 'w-[90%]', 95: 'w-[95%]', 100: 'w-full',
};

function widthClass(percent) {
  const rounded = Math.round(percent / 5) * 5;
  return WIDTHS[rounded];
}
