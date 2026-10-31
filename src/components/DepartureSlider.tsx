import { CalendarClock } from 'lucide-react';
import { HOUR_MS, formatLocalTime } from '@/lib/time';

interface DepartureSliderProps {
  minMs: number;
  maxMs: number;
  valueMs: number;
  utcOffsetSeconds: number;
  onChange: (valueMs: number) => void;
}

export default function DepartureSlider({ minMs, maxMs, valueMs, utcOffsetSeconds, onChange }: DepartureSliderProps) {
  const maxIndex = Math.round((maxMs - minMs) / HOUR_MS);
  const index = Math.round((valueMs - minMs) / HOUR_MS);

  return (
    <section aria-labelledby="departure-heading" className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 id="departure-heading" className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <CalendarClock className="h-4 w-4 text-sky-700" aria-hidden="true" />
          Departure
        </h2>
        <span className="text-sm font-semibold tabular-nums text-sky-800">
          {formatLocalTime(valueMs, utcOffsetSeconds)}
        </span>
      </div>

      <input
        type="range"
        min={0}
        max={maxIndex}
        step={1}
        value={index}
        onChange={(event) => onChange(minMs + Number(event.target.value) * HOUR_MS)}
        aria-label="Departure time"
        aria-valuetext={formatLocalTime(valueMs, utcOffsetSeconds)}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-sky-700"
      />

      <div className="flex justify-between text-xs text-slate-500">
        <span>{formatLocalTime(minMs, utcOffsetSeconds)}</span>
        <span>{formatLocalTime(maxMs, utcOffsetSeconds)}</span>
      </div>
    </section>
  );
}
