import type { DailyForecast } from '../../types/forecast';
import { SectionHeading } from '../ui/SectionHeading';
import { ForecastDayCard, type ForecastDay } from './ForecastDayCard';

/**
 * Zips the API's parallel arrays into per-day objects, skipping any index
 * with missing data (defensive with `noUncheckedIndexedAccess`). Open-Meteo
 * may emit `null` in cells without data (QA LOW-2), so `null` is treated
 * like a missing index.
 */
function toForecastDays(daily: DailyForecast): ForecastDay[] {
  return daily.time.flatMap((date, index) => {
    const weatherCode = daily.weather_code[index];
    const tempMax = daily.temperature_2m_max[index];
    const tempMin = daily.temperature_2m_min[index];
    // Decision: a null precipitation probability only means "no precipitation
    // data" for that day, so the day is still rendered (the card simply hides
    // the percentage) instead of being dropped entirely.
    const precipitationProbability = daily.precipitation_probability_max[index] ?? null;
    if (weatherCode == null || tempMax == null || tempMin == null) {
      return [];
    }
    // isToday comes from the ORIGINAL API index: if day 0 is dropped for
    // missing data, tomorrow must not inherit the "Hoy" label. The index is
    // kept so day selection maps back to daily.time / hourly slicing.
    return [
      {
        date,
        index,
        weatherCode,
        tempMax,
        tempMin,
        precipitationProbability,
        isToday: index === 0,
      },
    ];
  });
}

interface ForecastListProps {
  daily: DailyForecast;
  /** ORIGINAL API index of the day whose hourly detail is shown. */
  selectedDayIndex: number;
  onSelectDay: (index: number) => void;
}

/** 7-day forecast: stacked rows on mobile, 7-column grid on md+. */
export function ForecastList({ daily, selectedDayIndex, onSelectDay }: ForecastListProps) {
  const days = toForecastDays(daily);

  return (
    <section>
      <SectionHeading>Pronóstico de 7 días</SectionHeading>
      <ul
        role="group"
        aria-label="Selecciona un día para ver el detalle por horas"
        className="mt-3 flex flex-col gap-2 md:grid md:grid-cols-7"
      >
        {days.map((day) => (
          <ForecastDayCard
            key={day.date}
            day={day}
            isSelected={day.index === selectedDayIndex}
            onSelect={() => {
              onSelectDay(day.index);
            }}
          />
        ))}
      </ul>
    </section>
  );
}
