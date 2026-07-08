import type { FavoriteCity } from '../../types/weather';

interface FavoritesListProps {
  favorites: FavoriteCity[];
  selectedCityId: number | null;
  onSelect: (city: FavoriteCity) => void;
}

/** Horizontal strip of favorite-city chips; clicking a chip selects the city. */
export function FavoritesList({ favorites, selectedCityId, onSelect }: FavoritesListProps) {
  return (
    <section>
      <h2 className="sr-only">Favoritas</h2>
      {favorites.length === 0 ? (
        <p className="text-sm text-ink-muted">
          Aún no tienes ciudades favoritas. Márcalas con la estrella ☆.
        </p>
      ) : (
        <ul className="flex gap-2 overflow-x-auto pb-1">
          {favorites.map((city) => {
            const isSelected = city.id === selectedCityId;
            return (
              <li key={city.id} className="shrink-0">
                <button
                  type="button"
                  title={city.country}
                  aria-current={isSelected ? 'true' : undefined}
                  onClick={() => {
                    onSelect(city);
                  }}
                  className={`inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-colors ${
                    isSelected
                      ? 'border-brand bg-brand-soft text-brand'
                      : 'border-line bg-surface-raised hover:bg-brand-soft'
                  }`}
                >
                  {city.name}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
