import type { ForecastResponse } from '../../types/forecast';
import type { GeocodingSearchResponse } from '../../types/geocoding';
import type { City } from '../../types/weather';

/** Mirrors a real Open-Meteo geocoding payload for "mad…". */
export const madridSearchResponse: GeocodingSearchResponse = {
  generationtime_ms: 0.6,
  results: [
    {
      id: 3117735,
      name: 'Madrid',
      latitude: 40.4165,
      longitude: -3.7026,
      country: 'España',
      country_code: 'ES',
      admin1: 'Comunidad de Madrid',
      timezone: 'Europe/Madrid',
      population: 3255944,
      elevation: 665,
    },
    {
      id: 2514392,
      name: 'Madridejos',
      latitude: 39.4682,
      longitude: -3.5325,
      country: 'España',
      country_code: 'ES',
      admin1: 'Castilla-La Mancha',
      timezone: 'Europe/Madrid',
      population: 11063,
    },
  ],
};

/** No matches: Open-Meteo omits `results` entirely. */
export const emptySearchResponse: GeocodingSearchResponse = {
  generationtime_ms: 0.4,
};

/** Domain city matching the first geocoding result above. */
export const madridCity: City = {
  id: 3117735,
  name: 'Madrid',
  admin1: 'Comunidad de Madrid',
  country: 'España',
  countryCode: 'ES',
  latitude: 40.4165,
  longitude: -3.7026,
};

/**
 * Forecast fixture. Current temperature (23.4 → "23°") intentionally rounds
 * to a value no daily max/min shares, so tests can assert it uniquely.
 */
export const madridForecastResponse: ForecastResponse = {
  latitude: 40.4165,
  longitude: -3.7026,
  timezone: 'Europe/Madrid',
  current: {
    time: '2026-07-08T14:30',
    temperature_2m: 23.4,
    apparent_temperature: 24.6,
    relative_humidity_2m: 62,
    wind_speed_10m: 14.2,
    weather_code: 2,
    is_day: 1,
  },
  current_units: {
    temperature_2m: '°C',
    apparent_temperature: '°C',
    relative_humidity_2m: '%',
    wind_speed_10m: 'km/h',
  },
  daily: {
    time: [
      '2026-07-08',
      '2026-07-09',
      '2026-07-10',
      '2026-07-11',
      '2026-07-12',
      '2026-07-13',
      '2026-07-14',
    ],
    weather_code: [2, 0, 3, 61, 95, 71, 45],
    temperature_2m_max: [26.1, 27.8, 24.9, 21.2, 20.5, 22.4, 25.3],
    temperature_2m_min: [12.1, 13.4, 11.9, 10.2, 9.8, 10.5, 11.7],
    precipitation_probability_max: [10, 0, 35, 80, 90, 60, 15],
  },
  daily_units: {
    temperature_2m_max: '°C',
    temperature_2m_min: '°C',
    precipitation_probability_max: '%',
  },
};
