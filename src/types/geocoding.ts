/** Raw types of the Open-Meteo Geocoding API (see ARCHITECTURE.md §4.1). */

export interface GeocodingSearchResponse {
  /** Absent (not empty array) when there are no matches. */
  results?: GeocodingResult[];
  generationtime_ms: number;
}

export interface GeocodingResult {
  /** Stable Open-Meteo location id, reused as favorite id. */
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  country_code: string;
  /** First-level region, e.g. "Comunidad de Madrid". */
  admin1?: string;
  timezone: string;
  population?: number;
  elevation?: number;
}
