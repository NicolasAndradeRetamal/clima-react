import type { HourlyForecast } from '../types/forecast';

/** One chart point. Nulls are preserved; recharts renders them as gaps. */
export interface HourlyPoint {
  /** "2026-07-17T14:00" */
  time: string;
  /** "14:00" (X-axis / tooltip) */
  hourLabel: string;
  /** °C */
  temperature: number | null;
  /** mm */
  precipitation: number | null;
  /** % */
  precipitationProbability: number | null;
}

/**
 * Extracts the hourly points whose `time` starts with `date` ("YYYY-MM-DD",
 * taken from daily.time[selectedDayIndex]). Prefix matching instead of
 * index arithmetic (dayIndex * 24) keeps it correct even if Open-Meteo
 * emits an irregular number of hours (DST days) and plays well with
 * `noUncheckedIndexedAccess`.
 */
export function selectHourlyForDay(hourly: HourlyForecast, date: string): HourlyPoint[] {
  const prefix = `${date}T`;
  return hourly.time.flatMap((time, index) => {
    if (!time.startsWith(prefix)) {
      return [];
    }
    return [
      {
        time,
        hourLabel: time.slice(prefix.length),
        temperature: hourly.temperature_2m[index] ?? null,
        precipitation: hourly.precipitation[index] ?? null,
        precipitationProbability: hourly.precipitation_probability[index] ?? null,
      },
    ];
  });
}
