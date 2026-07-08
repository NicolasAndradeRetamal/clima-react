import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { City, FavoriteCity } from '../types/weather';
import { useFavorites } from './useFavorites';

const STORAGE_KEY = 'clima-react:favorites';

function makeCity(id: number, name = `Ciudad ${id}`): City {
  return {
    id,
    name,
    admin1: 'Región',
    country: 'España',
    countryCode: 'ES',
    latitude: 40 + id * 0.01,
    longitude: -3 - id * 0.01,
  };
}

function readStorage(): unknown {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw === null ? null : JSON.parse(raw);
}

describe('useFavorites', () => {
  it('starts empty when there is nothing stored', () => {
    const { result } = renderHook(() => useFavorites());
    expect(result.current.favorites).toEqual([]);
  });

  it('adds a favorite and persists it to localStorage', () => {
    const { result } = renderHook(() => useFavorites());
    const madrid = makeCity(1, 'Madrid');

    act(() => {
      result.current.addFavorite(madrid);
    });

    expect(result.current.favorites).toEqual([madrid]);
    expect(result.current.isFavorite(1)).toBe(true);
    expect(readStorage()).toEqual([madrid]);
  });

  it('deduplicates by city id', () => {
    const { result } = renderHook(() => useFavorites());
    const madrid = makeCity(1, 'Madrid');

    act(() => {
      result.current.addFavorite(madrid);
    });
    act(() => {
      result.current.addFavorite({ ...madrid, name: 'Madrid (bis)' });
    });

    expect(result.current.favorites).toHaveLength(1);
    expect(result.current.favorites[0]?.name).toBe('Madrid');
  });

  it('removes a favorite and updates localStorage', () => {
    const { result } = renderHook(() => useFavorites());

    act(() => {
      result.current.addFavorite(makeCity(1));
      result.current.addFavorite(makeCity(2));
    });
    act(() => {
      result.current.removeFavorite(1);
    });

    expect(result.current.favorites.map((favorite) => favorite.id)).toEqual([2]);
    expect(readStorage()).toEqual(result.current.favorites);
  });

  it('toggles a favorite on and off', () => {
    const { result } = renderHook(() => useFavorites());
    const lima = makeCity(3, 'Lima');

    act(() => {
      result.current.toggleFavorite(lima);
    });
    expect(result.current.isFavorite(3)).toBe(true);

    act(() => {
      result.current.toggleFavorite(lima);
    });
    expect(result.current.isFavorite(3)).toBe(false);
    expect(readStorage()).toEqual([]);
  });

  it('caps the list at 10 favorites, dropping the oldest', () => {
    const { result } = renderHook(() => useFavorites());

    act(() => {
      for (let id = 1; id <= 11; id += 1) {
        result.current.addFavorite(makeCity(id));
      }
    });

    expect(result.current.favorites).toHaveLength(10);
    expect(result.current.isFavorite(1)).toBe(false); // oldest dropped
    expect(result.current.isFavorite(11)).toBe(true);
  });

  it('reads previously stored favorites', () => {
    const stored: FavoriteCity[] = [makeCity(7, 'Bogotá')];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));

    const { result } = renderHook(() => useFavorites());
    expect(result.current.favorites).toEqual(stored);
  });

  it('recovers from corrupted JSON with an empty list', () => {
    localStorage.setItem(STORAGE_KEY, '{not valid json');

    const { result } = renderHook(() => useFavorites());
    expect(result.current.favorites).toEqual([]);
  });

  it('deduplicates stored favorites by id, keeping the first occurrence', () => {
    const lima = makeCity(3, 'Lima');
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([lima, makeCity(3, 'Lima (duplicada)'), makeCity(4, 'Quito')]),
    );

    const { result } = renderHook(() => useFavorites());
    expect(result.current.favorites.map((favorite) => favorite.name)).toEqual(['Lima', 'Quito']);
  });

  it('discards stored entries with an invalid shape', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([{ id: 'nope' }, makeCity(5, 'Quito'), 42]),
    );

    const { result } = renderHook(() => useFavorites());
    expect(result.current.favorites.map((favorite) => favorite.name)).toEqual(['Quito']);
  });
});
