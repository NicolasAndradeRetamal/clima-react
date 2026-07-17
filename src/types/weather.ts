/** Domain types decoupled from the raw Open-Meteo payloads. */

export type WeatherKind =
  | 'clear'
  | 'partly-cloudy'
  | 'overcast'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'freezing-rain'
  | 'snow'
  | 'showers'
  | 'thunderstorm';

export interface WeatherCondition {
  /** Drives which icon is rendered. */
  kind: WeatherKind;
  /** Spanish description shown in the UI. */
  label: string;
}

/** A selectable location, derived from GeocodingResult. */
export interface City {
  id: number;
  name: string;
  admin1?: string;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
}

/** What is persisted in localStorage. Same shape, explicit alias for clarity. */
export type FavoriteCity = City;

/** What the app displays weather for: a searched city or the user's position. */
export interface SelectedLocation {
  latitude: number;
  longitude: number;
  /** UI heading: city name, or "Tu ubicación" for geolocation. */
  label: string;
  /** Secondary line (admin1, country); absent for geolocation. */
  sublabel?: string;
  /** Present when it came from search/favorites; enables the favorite toggle. */
  city?: City;
}
