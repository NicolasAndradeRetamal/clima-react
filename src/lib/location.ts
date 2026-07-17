import type { Coordinates } from '../api/forecast';
import type { City, SelectedLocation } from '../types/weather';

/** Wraps a searched/favorite city as the app's selected location. */
export function cityToLocation(city: City): SelectedLocation {
  return {
    latitude: city.latitude,
    longitude: city.longitude,
    label: city.name,
    sublabel: city.admin1 !== undefined ? `${city.admin1} · ${city.country}` : city.country,
    city,
  };
}

/**
 * Wraps browser-geolocation coordinates. Open-Meteo has no reverse geocoding,
 * so the fixed label "Tu ubicación" is shown and there is no `city` (which
 * also means it cannot be favorited — no stable id).
 */
export function currentPositionToLocation(coords: Coordinates): SelectedLocation {
  return {
    latitude: coords.latitude,
    longitude: coords.longitude,
    label: 'Tu ubicación',
  };
}
