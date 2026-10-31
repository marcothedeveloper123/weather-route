import { Droplets, Wind } from 'lucide-react';
import { describeWeatherCode } from '@/lib/weatherCodes';
import { formatDuration } from '@/lib/time';
import type { StopForecast } from '@/lib/types';

interface WeatherMarkerProps {
  item: StopForecast;
  selected: boolean;
}

function tripLabel({ stop }: StopForecast): string {
  if (stop.kind === 'start') return 'Start';
  if (stop.kind === 'destination') return 'End';
  return `+${Math.round(stop.drivingSeconds / 60)} min`;
}

export default function WeatherMarker({ item, selected }: WeatherMarkerProps) {
  const { hour, arrivalLabel } = item;
  const condition = describeWeatherCode(hour?.weatherCode ?? null);
  const Icon = condition.icon;
  const surface = selected ? 'bg-slate-900 text-white ring-2 ring-sky-400' : 'bg-white text-slate-900';
  const pointer = selected ? 'border-t-slate-900' : 'border-t-white';

  return (
    <div className="flex flex-col items-center">
      <div className={`flex h-[88px] w-[136px] flex-col justify-between rounded-lg px-2.5 py-1.5 shadow-lg transition ${surface}`}>
        <div className="flex items-center justify-between text-[11px] font-medium tabular-nums opacity-80">
          <span>{arrivalLabel}</span>
          <span>{tripLabel(item)}</span>
        </div>
        {hour ? (
          <>
            <div className="flex items-center gap-2">
              <Icon className={`h-6 w-6 shrink-0 ${condition.tone}`} aria-label={condition.label} />
              <span className="text-lg font-semibold tabular-nums">
                {hour.temperature !== null ? `${Math.round(hour.temperature)}°` : '--'}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] font-medium tabular-nums">
              <span className="flex items-center gap-1">
                <Droplets className="h-3 w-3" aria-hidden="true" />
                {hour.precipitationProbability !== null ? `${Math.round(hour.precipitationProbability)}%` : '--'}
              </span>
              <span className="flex items-center gap-1">
                <Wind className="h-3 w-3" aria-hidden="true" />
                {hour.windSpeed !== null ? `${Math.round(hour.windSpeed)} km/h` : '--'}
              </span>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center text-[11px] leading-tight">Forecast not available yet</div>
        )}
      </div>
      <div className={`h-0 w-0 border-x-[6px] border-t-[8px] border-x-transparent ${pointer}`} />
    </div>
  );
}
