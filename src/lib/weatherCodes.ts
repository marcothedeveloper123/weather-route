import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Sun,
  type LucideIcon,
} from 'lucide-react';

export interface WeatherCondition {
  label: string;
  icon: LucideIcon;
  tone: string;
}

export function describeWeatherCode(code: number | null): WeatherCondition {
  if (code === 0) return { label: 'Clear', icon: Sun, tone: 'text-amber-600' };
  if (code === 1) return { label: 'Mostly clear', icon: CloudSun, tone: 'text-amber-600' };
  if (code === 2) return { label: 'Partly cloudy', icon: CloudSun, tone: 'text-amber-600' };
  if (code === 3) return { label: 'Overcast', icon: Cloud, tone: 'text-slate-500' };
  if (code === 45 || code === 48) return { label: 'Fog', icon: CloudFog, tone: 'text-slate-500' };
  if (code !== null && code >= 51 && code <= 57) return { label: 'Drizzle', icon: CloudDrizzle, tone: 'text-sky-700' };
  if (code !== null && (code >= 61 && code <= 67 || code >= 80 && code <= 82)) {
    return { label: 'Rain', icon: CloudRain, tone: 'text-sky-700' };
  }
  if (code !== null && (code >= 71 && code <= 77 || code === 85 || code === 86)) {
    return { label: 'Snow', icon: CloudSnow, tone: 'text-cyan-700' };
  }
  if (code !== null && code >= 95) return { label: 'Thunderstorm', icon: CloudLightning, tone: 'text-orange-700' };
  return { label: 'Unknown', icon: Cloud, tone: 'text-slate-500' };
}
