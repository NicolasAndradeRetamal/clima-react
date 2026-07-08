import { useWeather } from '../../hooks/useWeather';
import type { City } from '../../types/weather';
import { EmptyState } from '../ui/EmptyState';
import { ErrorMessage } from '../ui/ErrorMessage';
import { SearchIcon } from '../ui/SearchIcon';
import { CurrentWeatherCard } from './CurrentWeatherCard';
import { ForecastList } from './ForecastList';
import { WeatherSkeleton } from './WeatherSkeleton';

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
    <div className="space-y-6">
      <CurrentWeatherCard
        city={city}
        current={data.current}
        isRefetching={isFetching}
        isFavorite={isFavorite(city.id)}
        onToggleFavorite={() => {
          onToggleFavorite(city);
        }}
      />
      <ForecastList daily={data.daily} />
    </div>
  );
}
