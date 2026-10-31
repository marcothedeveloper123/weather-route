import { UserFacingError } from '@/lib/errors';

export const HOUR_MS = 3_600_000;
export const MAX_LEAD_DAYS = 15;

export const MAX_LEAD_MS = MAX_LEAD_DAYS * 24 * HOUR_MS;

export function wallClockToEpochMs(date: string, time: string, utcOffsetSeconds: number): number {
  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes] = time.split(':').map(Number);
  return Date.UTC(year, month - 1, day, hours, minutes) - utcOffsetSeconds * 1000;
}

export function alignToHour(epochMs: number, utcOffsetSeconds: number, round: (value: number) => number): number {
  const wallMs = epochMs + utcOffsetSeconds * 1000;
  return round(wallMs / HOUR_MS) * HOUR_MS - utcOffsetSeconds * 1000;
}

export function validateDeparture(departureMs: number, nowMs: number): void {
  if (departureMs < nowMs) {
    throw new UserFacingError('That departure time has already passed. Choose a time from now on.');
  }
  if (departureMs > nowMs + MAX_LEAD_MS) {
    throw new UserFacingError(
      `Departures can only be planned up to ${MAX_LEAD_DAYS} days ahead. Choose an earlier date.`,
    );
  }
}

export function formatLocalTime(epochMs: number, utcOffsetSeconds: number, withDay = true): string {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'UTC',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  };
  if (withDay) {
    options.weekday = 'short';
    options.day = 'numeric';
    options.month = 'short';
  }
  return new Intl.DateTimeFormat('en-GB', options).format(new Date(epochMs + utcOffsetSeconds * 1000));
}

export function formatDuration(seconds: number): string {
  const totalMinutes = Math.round(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} h`;
  return `${hours} h ${minutes} min`;
}

export function formatKilometers(meters: number): string {
  return `${(meters / 1000).toFixed(meters < 10_000 ? 1 : 0)} km`;
}
