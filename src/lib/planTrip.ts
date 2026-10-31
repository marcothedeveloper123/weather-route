import { buildRouteStops } from '@/lib/routeStops';
import { fetchDrivingRoute } from '@/lib/route';
import { fetchHourlyForecast } from '@/lib/forecast';
import { geocodePlace } from '@/lib/geocode';
import { MAX_LEAD_MS, alignToHour, validateDeparture, wallClockToEpochMs } from '@/lib/time';
import type { PlanInput, TripPlan } from '@/lib/types';

const NOMINATIM_MIN_INTERVAL_MS = 1100;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function planTrip(input: PlanInput): Promise<TripPlan> {
  const start = await geocodePlace(input.startQuery);
  await sleep(NOMINATIM_MIN_INTERVAL_MS);
  const destination = await geocodePlace(input.destinationQuery);

  const route = await fetchDrivingRoute(start, destination);
  const stops = buildRouteStops(route);
  const forecasts = await fetchHourlyForecast(stops);

  const startUtcOffsetSeconds = forecasts[0].utcOffsetSeconds;
  const nowMs = Date.now();
  const departureMs = alignToHour(
    wallClockToEpochMs(input.departureDate, input.departureTime, startUtcOffsetSeconds),
    startUtcOffsetSeconds,
    Math.floor,
  );
  validateDeparture(departureMs, nowMs);

  return {
    start,
    destination,
    geometry: route.coordinates.map(([lng, lat]) => [lat, lng]),
    stops,
    forecasts,
    startUtcOffsetSeconds,
    departureMs,
    sliderMinMs: alignToHour(nowMs, startUtcOffsetSeconds, Math.ceil),
    sliderMaxMs: alignToHour(nowMs + MAX_LEAD_MS, startUtcOffsetSeconds, Math.floor),
  };
}
