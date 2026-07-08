import { fetchJson, FORECAST_BASE_URL } from './client';
import type { ForecastResponse } from '../types/forecast';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/** Fetches current weather plus the 7-day daily forecast for a location. */
export async function fetchForecast(
  { latitude, longitude }: Coordinates,
  signal?: AbortSignal,
): Promise<ForecastResponse> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current:
      'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    timezone: 'auto',
    forecast_days: '7',
    wind_speed_unit: 'kmh',
  });
  return fetchJson<ForecastResponse>(`${FORECAST_BASE_URL}/forecast?${params.toString()}`, {
    signal,
  });
}
