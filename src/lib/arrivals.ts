import { HOUR_MS, formatLocalTime } from '@/lib/time';
import type { HourForecast, HourlyLocation, StopForecast, TripPlan } from '@/lib/types';

function findHourForecast(forecast: HourlyLocation, arrivalMs: number): HourForecast | null {
  const wallMs = arrivalMs + forecast.utcOffsetSeconds * 1000;
  const hourStartWallMs = Math.floor(wallMs / HOUR_MS) * HOUR_MS;
  const index = (hourStartWallMs - forecast.firstHourWallMs) / HOUR_MS;
  if (!Number.isInteger(index) || index < 0 || index >= forecast.temperature.length) {
    return null;
  }
  return {
    temperature: forecast.temperature[index],
    precipitationProbability: forecast.precipitationProbability[index],
    windSpeed: forecast.windSpeed[index],
    weatherCode: forecast.weatherCode[index],
  };
}

export function buildStopForecasts(plan: TripPlan, departureMs: number): StopForecast[] {
  return plan.stops.map((stop, index) => {
    const forecast = plan.forecasts[index];
    const arrivalMs = departureMs + stop.drivingSeconds * 1000;
    return {
      index,
      stop,
      arrivalMs,
      arrivalLabel: formatLocalTime(arrivalMs, forecast.utcOffsetSeconds, false),
      hour: findHourForecast(forecast, arrivalMs),
    };
  });
}
