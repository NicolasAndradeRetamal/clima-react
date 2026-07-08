import { formatDayName, formatPercent, formatTemperature } from '../../lib/format';
import { getWeatherCondition } from '../../lib/weatherCodes';
import { WeatherIcon } from './WeatherIcon';

export interface ForecastDay {
  /** "YYYY-MM-DD" */
  date: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  /** % */
  precipitationProbability: number;
}

/** Precipitation probability below this threshold is visual noise. */
const PRECIPITATION_DISPLAY_THRESHOLD = 20;

interface ForecastDayCardProps {
  day: ForecastDay;
  isToday: boolean;
}

/** One forecast day: row on mobile, compact vertical card on md+. */
export function ForecastDayCard({ day, isToday }: ForecastDayCardProps) {
  const condition = getWeatherCondition(day.weatherCode);
  const showPrecipitation = day.precipitationProbability >= PRECIPITATION_DISPLAY_THRESHOLD;

  return (
    <li className="flex items-center gap-3 rounded-2xl border border-line bg-surface-raised px-4 py-3 md:flex-col md:gap-1 md:px-2 md:py-4 md:text-center">
      <span className="w-12 text-sm font-medium capitalize md:w-auto">
        {isToday ? 'Hoy' : formatDayName(day.date)}
      </span>
      <WeatherIcon kind={condition.kind} isDay className="size-8 text-brand" />
      <span className="sr-only">{condition.label}</span>
      <span className="min-h-4 text-xs text-brand tabular-nums">
        {showPrecipitation ? formatPercent(day.precipitationProbability) : null}
      </span>
      <div className="ml-auto flex items-baseline gap-1 md:ml-0 md:flex-col md:items-center md:gap-0">
        <span className="text-sm font-semibold tabular-nums">{formatTemperature(day.tempMax)}</span>
        <span aria-hidden="true" className="text-sm text-ink-muted md:hidden">
          /
        </span>
        <span className="text-sm text-ink-muted tabular-nums">{formatTemperature(day.tempMin)}</span>
      </div>
    </li>
  );
}
