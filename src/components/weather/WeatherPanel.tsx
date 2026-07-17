import { lazy, Suspense, useState } from 'react';
import { useWeather } from '../../hooks/useWeather';
import { formatLongDayName } from '../../lib/format';
import { selectHourlyForDay } from '../../lib/hourly';
import type { ForecastResponse } from '../../types/forecast';
import type { City } from '../../types/weather';
import { EmptyState } from '../ui/EmptyState';
import { ErrorMessage } from '../ui/ErrorMessage';
import { SearchIcon } from '../ui/SearchIcon';
import { SectionHeading } from '../ui/SectionHeading';
import { CurrentWeatherCard } from './CurrentWeatherCard';
import { ForecastList } from './ForecastList';
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
  city: City;
  data: ForecastResponse;
  isRefetching: boolean;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

/**
 * Success state: current card, selectable 7-day list and hourly chart.
 * Owns the selected-day state; the parent remounts it via `key` when the
 * location changes, so the selection resets to today without effects.
 */
function WeatherContent({
  city,
  data,
  isRefetching,
  isFavorite,
  onToggleFavorite,
}: WeatherContentProps) {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

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
        city={city}
        current={data.current}
        isRefetching={isRefetching}
        isFavorite={isFavorite}
        onToggleFavorite={onToggleFavorite}
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
  city: City | null;
  isFavorite: (cityId: number) => boolean;
  onToggleFavorite: (city: City) => void;
}

/**
 * Weather section for the selected city. Owns the `useWeather` query and
 * renders every remote state: empty (no city), loading, error and success.
 */
export function WeatherPanel({ city, isFavorite, onToggleFavorite }: WeatherPanelProps) {
  const { data, isPending, isError, isFetching, refetch } = useWeather(city);

  if (city === null) {
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

  return (
    <WeatherContent
      key={`${city.latitude},${city.longitude}`}
      city={city}
      data={data}
      isRefetching={isFetching}
      isFavorite={isFavorite(city.id)}
      onToggleFavorite={() => {
        onToggleFavorite(city);
      }}
    />
  );
}
