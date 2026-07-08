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
