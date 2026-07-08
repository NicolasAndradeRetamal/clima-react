import { fetchJson, GEOCODING_BASE_URL } from './client';
import type { GeocodingResult, GeocodingSearchResponse } from '../types/geocoding';
import type { City } from '../types/weather';

/** Single mapping point from the raw API shape to the domain `City`. */
function toCity(result: GeocodingResult): City {
  return {
    id: result.id,
    name: result.name,
    admin1: result.admin1,
    country: result.country,
    countryCode: result.country_code,
    latitude: result.latitude,
    longitude: result.longitude,
  };
}

/**
 * Searches cities by name (Spanish localized results).
 * Normalizes the API's absent `results` to an empty array; an empty array for
 * a non-empty query is the "ciudad no encontrada" state, not an error.
 */
export async function searchCities(query: string, signal?: AbortSignal): Promise<City[]> {
  const params = new URLSearchParams({
    name: query,
    count: '8',
    language: 'es',
    format: 'json',
  });
  const data = await fetchJson<GeocodingSearchResponse>(
    `${GEOCODING_BASE_URL}/search?${params.toString()}`,
    { signal },
  );
  return (data.results ?? []).map(toCity);
}
