import { UserFacingError } from '@/lib/errors';
import type { Place } from '@/lib/types';

interface OsrmRoute {
  geometry: { coordinates: [number, number][] };
  legs: { annotation?: { duration: number[]; distance: number[] } }[];
}

interface OsrmResponse {
  code: string;
  routes?: OsrmRoute[];
}

export interface DrivingRoute {
  coordinates: [number, number][];
  durations: number[];
  distances: number[];
}

export async function fetchDrivingRoute(start: Place, destination: Place): Promise<DrivingRoute> {
  const waypoints = [start, destination].map((place) => `${place.lng},${place.lat}`).join(';');
  const url = `https://router.project-osrm.org/route/v1/driving/${waypoints}?overview=full&geometries=geojson&annotations=duration,distance`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new UserFacingError('The routing service is unavailable right now. Please try again in a moment.');
  }

  const data = (await response.json()) as OsrmResponse;
  const route = data.routes?.[0];
  if (data.code !== 'Ok' || !route) {
    throw new UserFacingError('No driving route was found between these two places.');
  }

  const coordinates = route.geometry.coordinates;
  const annotation = route.legs[0]?.annotation;
  if (!annotation || coordinates.length < 2 || annotation.duration.length !== coordinates.length - 1) {
    throw new UserFacingError('The route came back incomplete. Please try again.');
  }

  return { coordinates, durations: annotation.duration, distances: annotation.distance };
}
