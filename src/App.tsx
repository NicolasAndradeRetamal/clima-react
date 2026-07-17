import { useCallback, useEffect, useRef, useState } from 'react';
import { GeolocationBanner } from './components/location/GeolocationBanner';
import { CitySearch } from './components/search/CitySearch';
import { FavoritesList } from './components/favorites/FavoritesList';
import { OfflineBanner } from './components/ui/OfflineBanner';
import { WeatherIcon } from './components/weather/WeatherIcon';
import { WeatherPanel } from './components/weather/WeatherPanel';
import { useFavorites } from './hooks/useFavorites';
import { useGeolocation } from './hooks/useGeolocation';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { cityToLocation, currentPositionToLocation } from './lib/location';
import type { City, SelectedLocation } from './types/weather';

/** Single-view layout: header, search, geolocation, favorites and weather. */
export function App() {
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation | null>(null);
  const { favorites, isFavorite, toggleFavorite } = useFavorites();
  const { status: geolocationStatus, coords, requestLocation } = useGeolocation();
  const isOnline = useOnlineStatus();

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

  // One-shot: set when granting unmounts the focused banner button, consumed
  // when the location heading mounts and picks up the focus.
  const pendingHeadingFocus = useRef(false);

  const handleGrantedFocusHandoff = useCallback(() => {
    pendingHeadingFocus.current = true;
  }, []);

  const focusLocationHeading = useCallback((heading: HTMLHeadingElement) => {
    if (!pendingHeadingFocus.current) {
      return;
    }
    pendingHeadingFocus.current = false;
    // Only pick focus up from <body>; never steal it if the user moved on.
    if (document.activeElement === document.body) {
      heading.focus();
    }
  }, []);

  return (
    <div className="min-h-dvh">
      {!isOnline && <OfflineBanner />}
      <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
        <header className="flex h-14 items-center gap-2">
          <WeatherIcon kind="clear" isDay className="size-6 text-brand" />
          <h1 className="text-lg font-semibold">Clima</h1>
        </header>
        <main className="space-y-6">
          <CitySearch onSelectCity={selectCity} />
          <GeolocationBanner
            status={geolocationStatus}
            onRequestLocation={requestLocation}
            onGrantedFocusHandoff={handleGrantedFocusHandoff}
          />
          <FavoritesList
            favorites={favorites}
            selectedCityId={selectedLocation?.city?.id ?? null}
            onSelect={selectCity}
          />
          <WeatherPanel
            location={selectedLocation}
            isFavorite={isFavorite}
            onToggleFavorite={toggleFavorite}
            onLocationHeadingMount={focusLocationHeading}
          />
        </main>
      </div>
    </div>
  );
}
