import { Clock, Flag, MapPin, Navigation, Ruler, TriangleAlert } from 'lucide-react';
import { describeWeatherCode } from '@/lib/weatherCodes';
import { formatDuration, formatKilometers } from '@/lib/time';
import type { StopForecast } from '@/lib/types';

interface StopListProps {
  items: StopForecast[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
}

function stopTitle({ stop, index }: StopForecast): string {
  if (stop.kind === 'start') return 'Start';
  if (stop.kind === 'destination') return 'Destination';
  return `Stop ${index}`;
}

export default function StopList({ items, selectedIndex, onSelect }: StopListProps) {
  const last = items[items.length - 1];

  return (
    <section aria-labelledby="stops-heading" className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <h2 id="stops-heading" className="text-sm font-semibold text-slate-900">Along the route</h2>
        <p className="flex items-center gap-3 text-xs text-slate-600">
          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" aria-hidden="true" />{formatDuration(last.stop.drivingSeconds)}</span>
          <span className="flex items-center gap-1"><Ruler className="h-3.5 w-3.5" aria-hidden="true" />{formatKilometers(last.stop.distanceMeters)}</span>
        </p>
      </div>

      <ol className="space-y-2">
        {items.map((item) => {
          const condition = describeWeatherCode(item.hour?.weatherCode ?? null);
          const Icon = condition.icon;
          const selected = item.index === selectedIndex;
          const TitleIcon = item.stop.kind === 'start' ? Navigation : item.stop.kind === 'destination' ? Flag : MapPin;

          return (
            <li key={item.index}>
              <button
                type="button"
                onClick={() => onSelect(item.index)}
                aria-pressed={selected}
                className={`w-full rounded-lg border px-3 py-2.5 text-left transition hover:border-sky-400 hover:bg-sky-50/60 focus:outline-none focus:ring-2 focus:ring-sky-600/30 ${
                  selected ? 'border-sky-600 bg-sky-50' : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <TitleIcon className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
                    <span className="truncate text-sm font-medium text-slate-900">{stopTitle(item)}</span>
                    <span className="shrink-0 text-xs text-slate-500">
                      {item.stop.kind === 'start' ? '' : formatDuration(item.stop.drivingSeconds)}
                    </span>
                  </div>
                  <span className="shrink-0 text-sm font-semibold tabular-nums text-slate-900">{item.arrivalLabel}</span>
                </div>

                {item.hour ? (
                  <div className="mt-2 flex items-center gap-3 text-xs tabular-nums text-slate-600">
                    <Icon className={`h-4 w-4 shrink-0 ${condition.tone}`} aria-label={condition.label} />
                    <span className="font-medium text-slate-900">
                      {item.hour.temperature !== null ? `${Math.round(item.hour.temperature)}°C` : '--'}
                    </span>
                    <span>Rain {item.hour.precipitationProbability !== null ? `${Math.round(item.hour.precipitationProbability)}%` : '--'}</span>
                    <span>Wind {item.hour.windSpeed !== null ? `${Math.round(item.hour.windSpeed)} km/h` : '--'}</span>
                  </div>
                ) : (
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-amber-800">
                    <TriangleAlert className="h-3.5 w-3.5" aria-hidden="true" />
                    Forecast not available yet for this arrival time
                  </p>
                )}
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
