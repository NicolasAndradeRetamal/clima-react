import { useState } from 'react';
import { CitySearch } from './components/search/CitySearch';
import { FavoritesList } from './components/favorites/FavoritesList';
import { WeatherIcon } from './components/weather/WeatherIcon';
import { WeatherPanel } from './components/weather/WeatherPanel';
import { useFavorites } from './hooks/useFavorites';
import type { City } from './types/weather';

/** Single-view layout: header, search, favorites strip and weather panel. */
export function App() {
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const { favorites, isFavorite, toggleFavorite } = useFavorites();

  return (
    <div className="min-h-dvh">
      <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
        <header className="flex h-14 items-center gap-2">
          <WeatherIcon kind="clear" isDay className="size-6 text-brand" />
          <h1 className="text-lg font-semibold">Clima</h1>
        </header>
        <main className="space-y-6">
          <CitySearch onSelectCity={setSelectedCity} />
          <FavoritesList
            favorites={favorites}
            selectedCityId={selectedCity?.id ?? null}
            onSelect={setSelectedCity}
          />
          <WeatherPanel
            city={selectedCity}
            isFavorite={isFavorite}
            onToggleFavorite={toggleFavorite}
          />
        </main>
      </div>
    </div>
  );
}
