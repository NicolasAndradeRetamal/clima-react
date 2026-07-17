/** Raw types of the Open-Meteo Forecast API (see ARCHITECTURE.md §4.2). */

export interface ForecastResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  current: CurrentWeather;
  current_units: CurrentWeatherUnits;
  daily: DailyForecast;
  daily_units: DailyForecastUnits;
  hourly: HourlyForecast;
  hourly_units: HourlyForecastUnits;
}

export interface CurrentWeather {
  /** ISO 8601 local time, e.g. "2026-07-08T14:30". */
  time: string;
  /** °C */
  temperature_2m: number;
  /** °C (feels like) */
  apparent_temperature: number;
  /** % */
  relative_humidity_2m: number;
  /** km/h */
  wind_speed_10m: number;
  /** WMO code, see ARCHITECTURE.md §4.4. */
  weather_code: number;
  is_day: 0 | 1;
}

export interface CurrentWeatherUnits {
  temperature_2m: string;
  apparent_temperature: string;
  relative_humidity_2m: string;
  wind_speed_10m: string;
}

/**
 * Parallel arrays, all of length 7 (index i = day i, index 0 = today).
 * Open-Meteo may emit `null` in cells without data (QA LOW-2); `time` is
 * always a valid ISO date string.
 */
export interface DailyForecast {
  /** "YYYY-MM-DD" */
  time: string[];
  weather_code: (number | null)[];
  temperature_2m_max: (number | null)[];
  temperature_2m_min: (number | null)[];
  /** % */
  precipitation_probability_max: (number | null)[];
}

export interface DailyForecastUnits {
  temperature_2m_max: string;
  temperature_2m_min: string;
  precipitation_probability_max: string;
}

/**
 * Parallel arrays, 24 entries per forecast day (168 total), local-time
 * aligned (`timezone=auto`). Same nullability caveat as DailyForecast.
 */
export interface HourlyForecast {
  /** "YYYY-MM-DDTHH:mm" */
  time: string[];
  /** °C */
  temperature_2m: (number | null)[];
  /** mm */
  precipitation: (number | null)[];
  /** % */
  precipitation_probability: (number | null)[];
}

export interface HourlyForecastUnits {
  /** "°C" */
  temperature_2m: string;
  /** "mm" */
  precipitation: string;
  /** "%" */
  precipitation_probability: string;
}
