import type { DailyForecast } from '../../types/forecast';
import { ForecastDayCard, type ForecastDay } from './ForecastDayCard';

/**
 * Zips the API's parallel arrays into per-day objects, skipping any index
 * with missing data (defensive with `noUncheckedIndexedAccess`).
 */
function toForecastDays(daily: DailyForecast): ForecastDay[] {
  return daily.time.flatMap((date, index) => {
    const weatherCode = daily.weather_code[index];
    const tempMax = daily.temperature_2m_max[index];
    const tempMin = daily.temperature_2m_min[index];
    const precipitationProbability = daily.precipitation_probability_max[index];
    if (
      weatherCode === undefined ||
      tempMax === undefined ||
      tempMin === undefined ||
      precipitationProbability === undefined
    ) {
      return [];
    }
    return [{ date, weatherCode, tempMax, tempMin, precipitationProbability }];
  });
}

interface ForecastListProps {
  daily: DailyForecast;
}

/** 7-day forecast: stacked rows on mobile, 7-column grid on md+. */
export function ForecastList({ daily }: ForecastListProps) {
  const days = toForecastDays(daily);

  return (
    <section>
      <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
        Pronóstico de 7 días
      </h2>
      <ul className="mt-3 flex flex-col gap-2 md:grid md:grid-cols-7">
        {days.map((day, index) => (
          <ForecastDayCard key={day.date} day={day} isToday={index === 0} />
        ))}
      </ul>
    </section>
  );
}
