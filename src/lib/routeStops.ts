import type { DrivingRoute } from '@/lib/route';
import type { RouteStop } from '@/lib/types';

const STOP_INTERVAL_SECONDS = 30 * 60;

type StopPosition = Omit<RouteStop, 'kind'>;

export function buildRouteStops({ coordinates, durations, distances }: DrivingRoute): RouteStop[] {
  const cumulativeSeconds = [0];
  const cumulativeMeters = [0];
  durations.forEach((duration, i) => {
    cumulativeSeconds.push(cumulativeSeconds[i] + duration);
    cumulativeMeters.push(cumulativeMeters[i] + distances[i]);
  });
  const totalSeconds = cumulativeSeconds[cumulativeSeconds.length - 1];

  let segment = 0;
  const positionAt = (targetSeconds: number): StopPosition => {
    while (segment < durations.length - 1 && cumulativeSeconds[segment + 1] < targetSeconds) {
      segment++;
    }
    const segmentSeconds = durations[segment];
    const fraction = segmentSeconds > 0
      ? Math.min(Math.max((targetSeconds - cumulativeSeconds[segment]) / segmentSeconds, 0), 1)
      : 0;
    const [lngFrom, latFrom] = coordinates[segment];
    const [lngTo, latTo] = coordinates[segment + 1];
    return {
      lat: latFrom + (latTo - latFrom) * fraction,
      lng: lngFrom + (lngTo - lngFrom) * fraction,
      drivingSeconds: targetSeconds,
      distanceMeters: cumulativeMeters[segment] + distances[segment] * fraction,
    };
  };

  const stops: RouteStop[] = [{ kind: 'start', ...positionAt(0) }];
  for (let target = STOP_INTERVAL_SECONDS; target < totalSeconds; target += STOP_INTERVAL_SECONDS) {
    stops.push({ kind: 'waypoint', ...positionAt(target) });
  }
  stops.push({ kind: 'destination', ...positionAt(totalSeconds) });
  return stops;
}
