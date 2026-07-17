import { lazy, Suspense, useState } from 'react';
import { useWeather } from '../../hooks/useWeather';
import { formatLongDayName } from '../../lib/format';
import { selectHourlyForDay } from '../../lib/hourly';
import type { ForecastResponse } from '../../types/forecast';
import type { City, SelectedLocation } from '../../types/weather';
import { EmptyState } from '../ui/EmptyState';
import { ErrorMessage } from '../ui/ErrorMessage';
import { SearchIcon } from '../ui/SearchIcon';
import { SectionHeading } from '../ui/SectionHeading';
import { CurrentWeatherCard } from './CurrentWeatherCard';
import { ForecastList, toForecastDays } from './ForecastList';
import { WeatherSkeleton } from './WeatherSkeleton';

// Recharts lives in its own chunk: it never penalizes the initial load.
const HourlyChart = lazy(() => import('./HourlyChart'));

/** Same-height placeholder while the lazy chart chunk loads (no layout shift). */
function HourlyChartFallback({ title }: { title: string }) {
  return (
    <section role="status">
      <span className="sr-only">Cargando el gráfico…</span>
      <SectionHeading>{title}</SectionHeading>
      <div
        aria-hidden="true"
        className="mt-3 h-56 animate-pulse rounded-2xl bg-surface-sunken motion-reduce:animate-none md:h-64"
      />
    </section>
  );
}

interface WeatherContentProps {
  location: SelectedLocation;
  data: ForecastResponse;
  isRefetching: boolean;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onLocationHeadingMount?: (heading: HTMLHeadingElement) => void;
}

/**
 * Success state: current card, selectable 7-day list and hourly chart.
 * Owns the selected-day state; the parent remounts it via `key` when the
 * location changes, so the selection resets to today without effects.
 */
function WeatherContent({
  location,
  data,
  isRefetching,
  isFavorite,
  onToggleFavorite,
  onLocationHeadingMount,
}: WeatherContentProps) {
  // Seed the selection with the first day ForecastList actually renders: if
  // today (index 0) is dropped for missing data, starting at 0 would leave
  // an orphan selection with no card marked aria-pressed="true".
  const [selectedDayIndex, setSelectedDayIndex] = useState(
    () => toForecastDays(data.daily)[0]?.index ?? 0,
  );

  const selectedDate = data.daily.time[selectedDayIndex];
  const points = selectedDate === undefined ? [] : selectHourlyForDay(data.hourly, selectedDate);
  const hasHourlyData = points.some(
    (point) =>
      point.temperature !== null ||
      point.precipitation !== null ||
      point.precipitationProbability !== null,
  );
  const title =
    selectedDate === undefined
      ? null
      : `Pronóstico por horas · ${selectedDayIndex === 0 ? 'hoy' : formatLongDayName(selectedDate)}`;

  return (
    <div className="space-y-6">
      <CurrentWeatherCard
        location={location}
        current={data.current}
        isRefetching={isRefetching}
        isFavorite={isFavorite}
        onToggleFavorite={onToggleFavorite}
        onLocationHeadingMount={onLocationHeadingMount}
      />
      <ForecastList
        daily={data.daily}
        selectedDayIndex={selectedDayIndex}
        onSelectDay={setSelectedDayIndex}
      />
      {title !== null &&
        (hasHourlyData ? (
          <Suspense fallback={<HourlyChartFallback title={title} />}>
            <HourlyChart points={points} units={data.hourly_units} title={title} />
          </Suspense>
        ) : (
          <section>
            <SectionHeading>{title}</SectionHeading>
            <div className="mt-3 rounded-2xl border border-dashed border-line px-6 py-8 text-center">
              <p className="text-sm text-ink-muted">Sin datos horarios para este día</p>
            </div>
          </section>
        ))}
    </div>
  );
}

interface WeatherPanelProps {
  location: SelectedLocation | null;
  isFavorite: (cityId: number) => boolean;
  onToggleFavorite: (city: City) => void;
  /** Forwarded to CurrentWeatherCard (focus handoff, DESIGN.md §9.3). */
  onLocationHeadingMount?: (heading: HTMLHeadingElement) => void;
}

/**
 * Weather section for the selected location (searched city or geolocation).
 * Owns the `useWeather` query and renders every remote state: empty (no
 * selection), loading, error and success.
 */
export function WeatherPanel({
  location,
  isFavorite,
  onToggleFavorite,
  onLocationHeadingMount,
}: WeatherPanelProps) {
  const coords =
    location === null ? null : { latitude: location.latitude, longitude: location.longitude };
  const { data, isPending, isError, isFetching, refetch } = useWeather(coords);

  if (location === null) {
    return (
      <EmptyState
        icon={<SearchIcon className="size-10 text-ink-muted" />}
        message="Busca una ciudad para ver el clima"
      />
    );
  }

  if (isPending) {
    return <WeatherSkeleton />;
  }

  if (isError || data === undefined) {
    return (
      <ErrorMessage
        message="No se pudo cargar el clima. Comprueba tu conexión e inténtalo de nuevo."
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  const city = location.city;
  return (
    <WeatherContent
      key={`${location.latitude},${location.longitude}`}
      location={location}
      data={data}
      isRefetching={isFetching}
      isFavorite={city !== undefined && isFavorite(city.id)}
      onLocationHeadingMount={onLocationHeadingMount}
      onToggleFavorite={() => {
        if (city !== undefined) {
          onToggleFavorite(city);
        }
      }}
    />
  );
}
