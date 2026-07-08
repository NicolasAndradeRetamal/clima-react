import { useCallback, useState } from 'react';
import type { City, FavoriteCity } from '../types/weather';

const STORAGE_KEY = 'clima-react:favorites';
const MAX_FAVORITES = 10;

function isFavoriteCity(value: unknown): value is FavoriteCity {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === 'number' &&
    typeof candidate.name === 'string' &&
    typeof candidate.country === 'string' &&
    typeof candidate.countryCode === 'string' &&
    typeof candidate.latitude === 'number' &&
    typeof candidate.longitude === 'number' &&
    (candidate.admin1 === undefined || typeof candidate.admin1 === 'string')
  );
}

/** Reads favorites from localStorage; corrupted or invalid data yields []. */
function readStoredFavorites(): FavoriteCity[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      return [];
    }
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(isFavoriteCity).slice(0, MAX_FAVORITES);
  } catch {
    return [];
  }
}

function persistFavorites(favorites: FavoriteCity[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  } catch {
    // Storage full or unavailable: favorites stay in-memory for the session.
  }
}

export interface UseFavoritesResult {
  favorites: FavoriteCity[];
  isFavorite: (cityId: number) => boolean;
  addFavorite: (city: City) => void;
  removeFavorite: (cityId: number) => void;
  toggleFavorite: (city: City) => void;
}

/**
 * Favorite cities persisted in localStorage. Deduplicated by id and capped at
 * 10 entries (oldest dropped). Never crashes on corrupted storage.
 */
export function useFavorites(): UseFavoritesResult {
  const [favorites, setFavorites] = useState<FavoriteCity[]>(readStoredFavorites);

  const update = useCallback((updater: (current: FavoriteCity[]) => FavoriteCity[]) => {
    setFavorites((current) => {
      const next = updater(current);
      persistFavorites(next);
      return next;
    });
  }, []);

  const addFavorite = useCallback(
    (city: City) => {
      update((current) => {
        if (current.some((favorite) => favorite.id === city.id)) {
          return current;
        }
        return [...current, city].slice(-MAX_FAVORITES);
      });
    },
    [update],
  );

  const removeFavorite = useCallback(
    (cityId: number) => {
      update((current) => current.filter((favorite) => favorite.id !== cityId));
    },
    [update],
  );

  const toggleFavorite = useCallback(
    (city: City) => {
      update((current) => {
        if (current.some((favorite) => favorite.id === city.id)) {
          return current.filter((favorite) => favorite.id !== city.id);
        }
        return [...current, city].slice(-MAX_FAVORITES);
      });
    },
    [update],
  );

  const isFavorite = useCallback(
    (cityId: number) => favorites.some((favorite) => favorite.id === cityId),
    [favorites],
  );

  return { favorites, isFavorite, addFavorite, removeFavorite, toggleFavorite };
}
