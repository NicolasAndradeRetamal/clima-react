import { useEffect, useState, type KeyboardEvent } from 'react';
import { useCitySearch } from '../../hooks/useCitySearch';
import type { City } from '../../types/weather';
import { SearchIcon } from '../ui/SearchIcon';
import { Spinner } from '../ui/Spinner';
import { LISTBOX_ID, optionId, SearchResultsList } from './SearchResultsList';

const INPUT_ID = 'city-search';

interface CitySearchProps {
  onSelectCity: (city: City) => void;
}

/** Accessible city autocomplete (WAI-ARIA combobox with aria-activedescendant). */
export function CitySearch({ onSelectCity }: CitySearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const { data, isError, isFetching, isDebouncing, debouncedQuery } = useCitySearch(query);
  const trimmedQuery = debouncedQuery.trim();
  const results = data ?? [];

  // New results (or an error) invalidate the highlighted option.
  useEffect(() => {
    setActiveIndex(null);
  }, [debouncedQuery, isError]);

  const isBusy = isDebouncing || isFetching;
  const showDropdown =
    isOpen && trimmedQuery.length >= 2 && (isError || data !== undefined);
  // The listbox <ul> only exists when SearchResultsList has options to show
  // (its error and no-results rows are plain <p> elements), so aria-controls
  // must reference it only while it is actually in the DOM (QA LOW-1).
  const isListboxRendered = showDropdown && !isError && results.length > 0;

  const activeCity = activeIndex !== null ? results[activeIndex] : undefined;

  function selectCity(city: City): void {
    onSelectCity(city);
    setQuery('');
    setIsOpen(false);
    setActiveIndex(null);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setIsOpen(true);
        if (results.length > 0) {
          setActiveIndex((current) => (current === null ? 0 : (current + 1) % results.length));
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        setIsOpen(true);
        if (results.length > 0) {
          setActiveIndex((current) =>
            current === null ? results.length - 1 : (current - 1 + results.length) % results.length,
          );
        }
        break;
      case 'Enter': {
        if (!showDropdown || results.length === 0) {
          break;
        }
        event.preventDefault();
        const city = activeCity ?? results[0];
        if (city !== undefined) {
          selectCity(city);
        }
        break;
      }
      case 'Escape':
        setIsOpen(false);
        setActiveIndex(null);
        break;
      case 'Tab':
        setIsOpen(false);
        break;
    }
  }

  return (
    <div className="relative">
      <label className="sr-only" htmlFor={INPUT_ID}>
        Buscar ciudad
      </label>
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-ink-muted" />
        <input
          id={INPUT_ID}
          type="text"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls={isListboxRendered ? LISTBOX_ID : undefined}
          aria-autocomplete="list"
          aria-activedescendant={activeCity !== undefined ? optionId(activeCity.id) : undefined}
          autoComplete="off"
          spellCheck={false}
          placeholder="Buscar ciudad…"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            setIsOpen(true);
          }}
          onBlur={() => {
            setIsOpen(false);
          }}
          onKeyDown={handleKeyDown}
          className="h-12 w-full rounded-lg border border-line bg-surface-raised pl-10 pr-10 text-base text-ink placeholder:text-ink-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        />
        {isBusy && (
          <span role="status" className="absolute right-3 top-1/2 -translate-y-1/2">
            <Spinner className="size-5 text-ink-muted" />
            <span className="sr-only">Cargando…</span>
          </span>
        )}
      </div>
      {showDropdown && (
        <SearchResultsList
          results={results}
          activeIndex={activeIndex}
          query={trimmedQuery}
          isError={isError}
          onSelect={selectCity}
          onActiveIndexChange={setActiveIndex}
        />
      )}
    </div>
  );
}
