import { useCallback, useEffect, useState } from 'react';
import { GeolocationBanner } from './components/location/GeolocationBanner';
import { CitySearch } from './components/search/CitySearch';
import { FavoritesList } from './components/favorites/FavoritesList';
import { WeatherIcon } from './components/weather/WeatherIcon';
import { WeatherPanel } from './components/weather/WeatherPanel';
import { useFavorites } from './hooks/useFavorites';
import { useGeolocation } from './hooks/useGeolocation';
import { cityToLocation, currentPositionToLocation } from './lib/location';
import type { City, SelectedLocation } from './types/weather';

/** Single-view layout: header, search, geolocation, favorites and weather. */
export function App() {
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation | null>(null);
  const { favorites, isFavorite, toggleFavorite } = useFavorites();
  const { status: geolocationStatus, coords, requestLocation } = useGeolocation();

  // Auto-select the user's position, but never override a manual selection
  // (a searched city or a favorite chip already chosen).
  useEffect(() => {
    if (geolocationStatus === 'granted' && coords !== null) {
      setSelectedLocation((previous) => previous ?? currentPositionToLocation(coords));
    }
  }, [geolocationStatus, coords]);

  const selectCity = useCallback((city: City) => {
    setSelectedLocation(cityToLocation(city));
  }, []);

  return (
    <div className="min-h-dvh">
      <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
        <header className="flex h-14 items-center gap-2">
          <WeatherIcon kind="clear" isDay className="size-6 text-brand" />
          <h1 className="text-lg font-semibold">Clima</h1>
        </header>
        <main className="space-y-6">
          <CitySearch onSelectCity={selectCity} />
          <GeolocationBanner status={geolocationStatus} onRequestLocation={requestLocation} />
          <FavoritesList
            favorites={favorites}
            selectedCityId={selectedLocation?.city?.id ?? null}
            onSelect={selectCity}
          />
          <WeatherPanel
            location={selectedLocation}
            isFavorite={isFavorite}
            onToggleFavorite={toggleFavorite}
          />
        </main>
      </div>
    </div>
  );
}
