/** Pure formatting helpers. All output targets Spanish (es-ES) UI. */

/** Rounds to integer and appends the degree sign: 23.4 → "23°". */
export function formatTemperature(celsius: number): string {
  return `${Math.round(celsius)}°`;
}

/** Rounds to integer km/h: 14.2 → "14 km/h". */
export function formatWind(kmh: number): string {
  return `${Math.round(kmh)} km/h`;
}

/** Rounds to integer percent: 61.5 → "62 %". */
export function formatPercent(value: number): string {
  return `${Math.round(value)} %`;
}

/**
 * Short es-ES weekday name for an ISO "YYYY-MM-DD" date: "mié", "jue".
 * Parses the parts manually to avoid UTC/local timezone day shifts.
 */
export function formatDayName(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  if (
    year === undefined ||
    month === undefined ||
    day === undefined ||
    Number.isNaN(year + month + day)
  ) {
    return isoDate;
  }
  const date = new Date(year, month - 1, day);
  // Some ICU versions abbreviate with a trailing period; normalize it away.
  return date.toLocaleDateString('es-ES', { weekday: 'short' }).replace(/\.$/, '');
}
