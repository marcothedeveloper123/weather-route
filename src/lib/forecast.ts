import { UserFacingError } from '@/lib/errors';
import type { HourlyLocation } from '@/lib/types';

const FORECAST_DAYS = 16;
const HOURLY_VARIABLES = ['temperature_2m', 'precipitation_probability', 'wind_speed_10m', 'weather_code'];

interface OpenMeteoLocation {
  utc_offset_seconds: number;
  hourly: {
    time: string[];
    temperature_2m: (number | null)[];
    precipitation_probability: (number | null)[];
    wind_speed_10m: (number | null)[];
    weather_code: (number | null)[];
  };
}

function parseLocation(location: OpenMeteoLocation, expectedLength: number): HourlyLocation {
  const { time, temperature_2m, precipitation_probability, wind_speed_10m, weather_code } = location.hourly;
  const series = [temperature_2m, precipitation_probability, wind_speed_10m, weather_code];
  const isComplete = time?.length === expectedLength
    && series.every((values) => Array.isArray(values) && values.length === time.length);
  if (!isComplete) {
    throw new UserFacingError('The weather forecast came back incomplete. Please try again.');
  }

  return {
    utcOffsetSeconds: location.utc_offset_seconds,
    firstHourWallMs: Date.parse(`${time[0]}:00Z`),
    temperature: temperature_2m,
    precipitationProbability: precipitation_probability,
    windSpeed: wind_speed_10m,
    weatherCode: weather_code,
  };
}

export async function fetchHourlyForecast(points: { lat: number; lng: number }[]): Promise<HourlyLocation[]> {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', points.map((point) => point.lat.toFixed(4)).join(','));
  url.searchParams.set('longitude', points.map((point) => point.lng.toFixed(4)).join(','));
  url.searchParams.set('hourly', HOURLY_VARIABLES.join(','));
  url.searchParams.set('forecast_days', String(FORECAST_DAYS));
  url.searchParams.set('timezone', 'auto');
  url.searchParams.set('temperature_unit', 'celsius');
  url.searchParams.set('wind_speed_unit', 'kmh');

  const response = await fetch(url);
  if (!response.ok) {
    throw new UserFacingError('The weather service is unavailable right now. Please try again in a moment.');
  }

  const data = (await response.json()) as OpenMeteoLocation | OpenMeteoLocation[];
  const locations = Array.isArray(data) ? data : [data];
  if (locations.length !== points.length) {
    throw new UserFacingError('The weather forecast came back incomplete. Please try again.');
  }

  const expectedLength = FORECAST_DAYS * 24;
  return locations.map((location) => parseLocation(location, expectedLength));
}
