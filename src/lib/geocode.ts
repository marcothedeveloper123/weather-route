import { UserFacingError } from '@/lib/errors';
import type { Place } from '@/lib/types';

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

function shortenLabel(displayName: string): string {
  return displayName.split(',').slice(0, 2).map((part) => part.trim()).join(', ');
}

export async function geocodePlace(query: string): Promise<Place> {
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('limit', '1');

  const response = await fetch(url);
  if (!response.ok) {
    throw new UserFacingError('The place search is unavailable right now. Please try again in a moment.');
  }

  const results = (await response.json()) as NominatimResult[];
  const first = results[0];
  if (!first) {
    throw new UserFacingError(`Couldn't find "${query}". Try a more specific place name.`);
  }

  const lat = Number(first.lat);
  const lng = Number(first.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new UserFacingError(`Couldn't locate "${query}". Try a more specific place name.`);
  }

  return { label: shortenLabel(first.display_name), lat, lng };
}
