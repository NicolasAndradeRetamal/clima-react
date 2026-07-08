import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { queryKeys } from '../api/client';
import { fetchForecast } from '../api/forecast';
import type { ForecastResponse } from '../types/forecast';
import type { City } from '../types/weather';

const WEATHER_STALE_TIME_MS = 10 * 60 * 1000; // 10 min — weather doesn't move faster.

/** Current weather + 7-day forecast for the selected city (disabled while null). */
export function useWeather(city: City | null): UseQueryResult<ForecastResponse, Error> {
  return useQuery({
    queryKey: city ? queryKeys.forecast(city.latitude, city.longitude) : ['forecast', 'idle'],
    queryFn: ({ signal }) => {
      if (city === null) {
        // Unreachable: the query is disabled while no city is selected.
        throw new Error('useWeather queryFn called without a selected city');
      }
      return fetchForecast({ latitude: city.latitude, longitude: city.longitude }, signal);
    },
    enabled: city !== null,
    staleTime: WEATHER_STALE_TIME_MS,
  });
}
