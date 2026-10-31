export interface PlanInput {
  startQuery: string;
  destinationQuery: string;
  departureDate: string;
  departureTime: string;
}

export interface Place {
  label: string;
  lat: number;
  lng: number;
}

export interface RouteStop {
  kind: 'start' | 'waypoint' | 'destination';
  lat: number;
  lng: number;
  drivingSeconds: number;
  distanceMeters: number;
}

export interface HourlyLocation {
  utcOffsetSeconds: number;
  firstHourWallMs: number;
  temperature: (number | null)[];
  precipitationProbability: (number | null)[];
  windSpeed: (number | null)[];
  weatherCode: (number | null)[];
}

export interface TripPlan {
  start: Place;
  destination: Place;
  geometry: [number, number][];
  stops: RouteStop[];
  forecasts: HourlyLocation[];
  startUtcOffsetSeconds: number;
  departureMs: number;
  sliderMinMs: number;
  sliderMaxMs: number;
}

export interface HourForecast {
  temperature: number | null;
  precipitationProbability: number | null;
  windSpeed: number | null;
  weatherCode: number | null;
}

export interface StopForecast {
  index: number;
  stop: RouteStop;
  arrivalMs: number;
  arrivalLabel: string;
  hour: HourForecast | null;
}
