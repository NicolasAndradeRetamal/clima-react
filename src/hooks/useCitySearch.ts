import { keepPreviousData, useQuery, type UseQueryResult } from '@tanstack/react-query';
import { queryKeys } from '../api/client';
import { searchCities } from '../api/geocoding';
import type { City } from '../types/weather';
import { useDebouncedValue } from './useDebouncedValue';

export type UseCitySearchResult = UseQueryResult<City[], Error> & {
  /** True while the user keeps typing and the debounce timer has not fired. */
  isDebouncing: boolean;
  /** The debounced query the current results belong to (for dropdown copy). */
  debouncedQuery: string;
};

/**
 * City autocomplete query. Debounces the input internally (300 ms) and only
 * fires for queries of 2+ characters. Previous results stay visible while the
 * next keystroke's query loads (no dropdown flicker).
 */
export function useCitySearch(query: string): UseCitySearchResult {
  const debouncedQuery = useDebouncedValue(query, 300);
  const trimmedQuery = debouncedQuery.trim();

  const result = useQuery({
    queryKey: queryKeys.citySearch(debouncedQuery),
    queryFn: () => searchCities(trimmedQuery),
    enabled: trimmedQuery.length >= 2,
    staleTime: Infinity,
    placeholderData: keepPreviousData,
  });

  return {
    ...result,
    isDebouncing: query !== debouncedQuery,
    debouncedQuery,
  };
}
