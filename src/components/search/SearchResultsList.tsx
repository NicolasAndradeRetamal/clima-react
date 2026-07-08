import type { City } from '../../types/weather';

export const LISTBOX_ID = 'city-search-listbox';

export function optionId(cityId: number): string {
  return `city-option-${cityId}`;
}

interface SearchResultsListProps {
  results: City[];
  activeIndex: number | null;
  /** The debounced query the results belong to (for the "no results" copy). */
  query: string;
  isError: boolean;
  onSelect: (city: City) => void;
  onActiveIndexChange: (index: number) => void;
}

/** Dropdown panel of the city combobox: options, empty and error rows. */
export function SearchResultsList({
  results,
  activeIndex,
  query,
  isError,
  onSelect,
  onActiveIndexChange,
}: SearchResultsListProps) {
  return (
    <div
      className="absolute inset-x-0 top-full z-10 mt-2 max-h-80 overflow-y-auto rounded-lg border border-line bg-surface-raised shadow-lg"
      // Keep DOM focus on the input so blur does not close the dropdown
      // before the option's click handler runs.
      onMouseDown={(event) => {
        event.preventDefault();
      }}
    >
      {isError ? (
        <p role="alert" className="px-4 py-3 text-sm text-danger">
          No se pudo buscar. Revisa tu conexión.
        </p>
      ) : results.length === 0 ? (
        <p role="status" className="px-4 py-3 text-sm text-ink-muted">
          No se encontraron ciudades para «{query}»
        </p>
      ) : (
        <ul id={LISTBOX_ID} role="listbox" aria-label="Ciudades sugeridas">
          {results.map((city, index) => {
            const isActive = index === activeIndex;
            return (
              <li
                key={city.id}
                id={optionId(city.id)}
                role="option"
                aria-selected={isActive}
                className={`flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left ${
                  isActive ? 'bg-brand-soft' : ''
                }`}
                onClick={() => {
                  onSelect(city);
                }}
                onMouseMove={() => {
                  onActiveIndexChange(index);
                }}
              >
                <div>
                  <p className="text-base font-medium text-ink">{city.name}</p>
                  <p className="text-xs text-ink-muted">
                    {city.admin1 ? `${city.admin1} · ${city.country}` : city.country}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
