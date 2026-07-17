import { formatDayName, formatPercent, formatTemperature } from '../../lib/format';
import { getWeatherCondition } from '../../lib/weatherCodes';
import { WeatherIcon } from './WeatherIcon';

export interface ForecastDay {
  /** "YYYY-MM-DD" */
  date: string;
  /** ORIGINAL API index (daily.time position), used for hourly selection. */
  index: number;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  /** %; null when the API has no precipitation data for the day. */
  precipitationProbability: number | null;
  /** True only for the day whose ORIGINAL API index was 0 (today). */
  isToday: boolean;
}

/** Precipitation probability below this threshold is visual noise. */
const PRECIPITATION_DISPLAY_THRESHOLD = 20;

interface ForecastDayCardProps {
  day: ForecastDay;
  /** Whether this day feeds the hourly chart below the list. */
  isSelected: boolean;
  onSelect: () => void;
}

/**
 * One forecast day: row on mobile, compact vertical card on md+. Rendered as
 * a toggle button that selects the day shown in the hourly chart.
 */
export function ForecastDayCard({ day, isSelected, onSelect }: ForecastDayCardProps) {
  const condition = getWeatherCondition(day.weatherCode);
  const precipitation = day.precipitationProbability;
  const showPrecipitation =
    precipitation !== null && precipitation >= PRECIPITATION_DISPLAY_THRESHOLD;

  return (
    <li>
      <button
        type="button"
        aria-pressed={isSelected}
        onClick={onSelect}
        className={`flex w-full cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors md:flex-col md:gap-1 md:px-2 md:py-4 md:text-center ${
          isSelected
            ? 'border-brand bg-brand-soft'
            : 'border-line bg-surface-raised hover:bg-brand-soft'
        }`}
      >
        <span
          className={`w-12 text-sm capitalize md:w-auto ${isSelected ? 'font-semibold' : 'font-medium'}`}
        >
          {day.isToday ? 'Hoy' : formatDayName(day.date)}
        </span>
        <WeatherIcon kind={condition.kind} isDay className="size-8 text-brand" />
        <span className="sr-only">{condition.label}</span>
        <span className="min-h-4 text-xs text-brand tabular-nums">
          {showPrecipitation ? formatPercent(precipitation) : null}
        </span>
        <span className="ml-auto flex items-baseline gap-1 md:ml-0 md:flex-col md:items-center md:gap-0">
          <span className="text-sm font-semibold tabular-nums">{formatTemperature(day.tempMax)}</span>
          <span aria-hidden="true" className="text-sm text-ink-muted md:hidden">
            /
          </span>
          <span className="text-sm text-ink-muted tabular-nums">{formatTemperature(day.tempMin)}</span>
        </span>
      </button>
    </li>
  );
}
