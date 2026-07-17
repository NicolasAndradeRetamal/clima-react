import type { WeatherCondition } from '../types/weather';

/** WMO weather code → domain condition. */
const WEATHER_CONDITIONS: Record<number, WeatherCondition> = {
  0: { kind: 'clear', label: 'Despejado' },
  1: { kind: 'clear', label: 'Mayormente despejado' },
  2: { kind: 'partly-cloudy', label: 'Parcialmente nublado' },
  3: { kind: 'overcast', label: 'Nublado' },
  45: { kind: 'fog', label: 'Niebla' },
  48: { kind: 'fog', label: 'Niebla' },
  51: { kind: 'drizzle', label: 'Llovizna' },
  53: { kind: 'drizzle', label: 'Llovizna' },
  55: { kind: 'drizzle', label: 'Llovizna' },
  56: { kind: 'freezing-rain', label: 'Llovizna helada' },
  57: { kind: 'freezing-rain', label: 'Llovizna helada' },
  61: { kind: 'rain', label: 'Lluvia' },
  63: { kind: 'rain', label: 'Lluvia' },
  65: { kind: 'rain', label: 'Lluvia' },
  66: { kind: 'freezing-rain', label: 'Lluvia helada' },
  67: { kind: 'freezing-rain', label: 'Lluvia helada' },
  71: { kind: 'snow', label: 'Nieve' },
  73: { kind: 'snow', label: 'Nieve' },
  75: { kind: 'snow', label: 'Nieve' },
  77: { kind: 'snow', label: 'Nieve' },
  80: { kind: 'showers', label: 'Chubascos' },
  81: { kind: 'showers', label: 'Chubascos' },
  82: { kind: 'showers', label: 'Chubascos' },
  85: { kind: 'snow', label: 'Chubascos de nieve' },
  86: { kind: 'snow', label: 'Chubascos de nieve' },
  95: { kind: 'thunderstorm', label: 'Tormenta' },
  96: { kind: 'thunderstorm', label: 'Tormenta con granizo' },
  99: { kind: 'thunderstorm', label: 'Tormenta con granizo' },
};

const UNKNOWN_CONDITION: WeatherCondition = {
  kind: 'overcast',
  label: 'Condición desconocida',
};

/** Maps a WMO code to its condition; unknown codes fall back safely. */
export function getWeatherCondition(code: number): WeatherCondition {
  return WEATHER_CONDITIONS[code] ?? UNKNOWN_CONDITION;
}
