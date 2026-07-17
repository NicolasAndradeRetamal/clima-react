import { useCallback } from 'react';
import { formatPercent, formatTemperature, formatWind } from '../../lib/format';
import { getWeatherCondition } from '../../lib/weatherCodes';
import type { CurrentWeather } from '../../types/forecast';
import type { SelectedLocation } from '../../types/weather';
import { FavoriteToggleButton } from '../favorites/FavoriteToggleButton';
import { LocationIcon } from '../ui/LocationIcon';
import { Spinner } from '../ui/Spinner';
import { WeatherIcon } from './WeatherIcon';

interface MetricTileProps {
  label: string;
  value: string;
}

function MetricTile({ label, value }: MetricTileProps) {
  return (
    <div className="rounded-lg bg-surface-sunken px-3 py-2">
      <dt className="text-xs text-ink-muted">{label}</dt>
      <dd className="text-sm font-medium tabular-nums">{value}</dd>
    </div>
  );
}

interface CurrentWeatherCardProps {
  location: SelectedLocation;
  current: CurrentWeather;
  /** Background refetch in progress (data stays visible). */
  isRefetching: boolean;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  /**
   * Called when the "Tu ubicación" heading mounts. It is the programmatic
   * focus target after granting geolocation from the banner (DESIGN.md §9.3).
   */
  onLocationHeadingMount?: (heading: HTMLHeadingElement) => void;
}

/** Hero card: location, condition, temperature, feels-like and metric tiles. */
export function CurrentWeatherCard({
  location,
  current,
  isRefetching,
  isFavorite,
  onToggleFavorite,
  onLocationHeadingMount,
}: CurrentWeatherCardProps) {
  const condition = getWeatherCondition(current.weather_code);
  // Geolocation ("Tu ubicación") has no geocoding id: no favorite toggle at
  // all (not even disabled) and a pin instead of the admin/country subline.
  const isCurrentPosition = location.city === undefined;

  const headingRef = useCallback(
    (heading: HTMLHeadingElement | null) => {
      if (heading !== null && isCurrentPosition) {
        onLocationHeadingMount?.(heading);
      }
    },
    [isCurrentPosition, onLocationHeadingMount],
  );

  return (
    <section className="rounded-2xl border border-line bg-surface-raised p-4 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            {/*
              tabIndex -1 (only for "Tu ubicación"): receives programmatic
              focus after the geolocation permission is granted, without
              entering the tab order (DESIGN.md §9.3).
            */}
            <h2
              ref={headingRef}
              tabIndex={isCurrentPosition ? -1 : undefined}
              className="inline-flex items-center gap-1.5 text-xl font-semibold"
            >
              {isCurrentPosition && <LocationIcon className="size-5 text-brand" />}
              {location.label}
            </h2>
            {isRefetching && (
              <span role="status">
                <Spinner className="size-4 text-ink-muted" />
                <span className="sr-only">Actualizando…</span>
              </span>
            )}
          </div>
          {location.sublabel !== undefined && (
            <p className="text-xs text-ink-muted">{location.sublabel}</p>
          )}
          <p className="mt-1 text-sm text-ink-muted">{condition.label}</p>
        </div>
        {!isCurrentPosition && (
          <FavoriteToggleButton isFavorite={isFavorite} onToggle={onToggleFavorite} />
        )}
      </div>

      <div className="mt-4 flex items-center gap-4">
        <WeatherIcon kind={condition.kind} isDay={current.is_day === 1} className="size-16 text-brand" />
        <div>
          <p className="text-6xl font-light tracking-tight tabular-nums">
            {formatTemperature(current.temperature_2m)}
          </p>
          <p className="text-sm text-ink-muted">
            Sensación térmica: {formatTemperature(current.apparent_temperature)}
          </p>
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-3">
        <MetricTile label="Viento" value={formatWind(current.wind_speed_10m)} />
        <MetricTile label="Humedad" value={formatPercent(current.relative_humidity_2m)} />
      </dl>
    </section>
  );
}
