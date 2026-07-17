import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { queryKeys } from '../api/client';
import { fetchForecast, type Coordinates } from '../api/forecast';
import type { ForecastResponse } from '../types/forecast';

const WEATHER_STALE_TIME_MS = 10 * 60 * 1000; // 10 min — weather doesn't move faster.

/**
 * Current weather + 7-day/hourly forecast for the selected coordinates
 * (disabled while null). Coordinates instead of a City so searched cities
 * and browser geolocation share the same query and cache.
 */
export function useWeather(coords: Coordinates | null): UseQueryResult<ForecastResponse, Error> {
  return useQuery({
    queryKey: coords ? queryKeys.forecast(coords.latitude, coords.longitude) : ['forecast', 'idle'],
    queryFn: ({ signal }) => {
      if (coords === null) {
        // Unreachable: the query is disabled while no location is selected.
        throw new Error('useWeather queryFn called without coordinates');
      }
      return fetchForecast(coords, signal);
    },
    enabled: coords !== null,
    staleTime: WEATHER_STALE_TIME_MS,
  });
}
