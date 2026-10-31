import { useState, type FormEvent } from 'react';
import { LoaderCircle, Search } from 'lucide-react';
import { HOUR_MS, MAX_LEAD_DAYS } from '@/lib/time';
import type { PlanInput } from '@/lib/types';

interface SearchFormProps {
  isLoading: boolean;
  errorMessage: string | null;
  onSubmit: (input: PlanInput) => void;
}

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-600/20';

const labelClass = 'mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-600';

function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function toTimeInputValue(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:00`;
}

export default function SearchForm({ isLoading, errorMessage, onSubmit }: SearchFormProps) {
  const [initialDeparture] = useState(() => new Date(Math.ceil(Date.now() / HOUR_MS) * HOUR_MS));
  const [startQuery, setStartQuery] = useState('');
  const [destinationQuery, setDestinationQuery] = useState('');
  const [departureDate, setDepartureDate] = useState(() => toDateInputValue(initialDeparture));
  const [departureTime, setDepartureTime] = useState(() => toTimeInputValue(initialDeparture));

  const maxDate = toDateInputValue(new Date(Date.now() + MAX_LEAD_DAYS * 24 * HOUR_MS));

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoading) return;
    onSubmit({ startQuery: startQuery.trim(), destinationQuery: destinationQuery.trim(), departureDate, departureTime });
  };

  const canSubmit = !isLoading && startQuery.trim() !== '' && destinationQuery.trim() !== '' && departureDate !== '';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="start" className={labelClass}>From</label>
        <input
          id="start"
          type="text"
          value={startQuery}
          onChange={(event) => setStartQuery(event.target.value)}
          placeholder="e.g. Boston, MA"
          className={inputClass}
          autoComplete="off"
          required
        />
      </div>

      <div>
        <label htmlFor="destination" className={labelClass}>To</label>
        <input
          id="destination"
          type="text"
          value={destinationQuery}
          onChange={(event) => setDestinationQuery(event.target.value)}
          placeholder="e.g. Portland, ME"
          className={inputClass}
          autoComplete="off"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="departure-date" className={labelClass}>Date</label>
          <input
            id="departure-date"
            type="date"
            value={departureDate}
            min={toDateInputValue(new Date())}
            max={maxDate}
            onChange={(event) => setDepartureDate(event.target.value)}
            className={inputClass}
            required
          />
        </div>
        <div>
          <label htmlFor="departure-time" className={labelClass}>Time</label>
          <input
            id="departure-time"
            type="time"
            step={HOUR_MS / 1000}
            value={departureTime}
            onChange={(event) => setDepartureTime(event.target.value)}
            className={inputClass}
            required
          />
        </div>
      </div>

      <p className="text-xs leading-relaxed text-slate-500">
        Times are in the local time of your starting point and are planned to the hour. Up to {MAX_LEAD_DAYS} days ahead.
      </p>

      {errorMessage && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm leading-relaxed text-red-800">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-sky-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
      >
        {isLoading ? (
          <>
            <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
            Planning trip
          </>
        ) : (
          <>
            <Search className="h-4 w-4" aria-hidden="true" />
            Plan trip
          </>
        )}
      </button>
    </form>
  );
}
