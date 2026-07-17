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
 * Millimeters with one es-ES decimal: 1.2 → "1,2 mm"; exactly zero → "0 mm".
 */
export function formatPrecipitation(mm: number): string {
  if (mm === 0) {
    return '0 mm';
  }
  const formatted = mm.toLocaleString('es-ES', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  return `${formatted} mm`;
}

/** Parses "YYYY-MM-DD" as a local date; null when malformed. */
function parseIsoDate(isoDate: string): Date | null {
  const [year, month, day] = isoDate.split('-').map(Number);
  if (
    year === undefined ||
    month === undefined ||
    day === undefined ||
    Number.isNaN(year + month + day)
  ) {
    return null;
  }
  return new Date(year, month - 1, day);
}

/**
 * Short es-ES weekday name for an ISO "YYYY-MM-DD" date: "mié", "jue".
 * Parses the parts manually to avoid UTC/local timezone day shifts.
 */
export function formatDayName(isoDate: string): string {
  const date = parseIsoDate(isoDate);
  if (date === null) {
    return isoDate;
  }
  // Some ICU versions abbreviate with a trailing period; normalize it away.
  return date.toLocaleDateString('es-ES', { weekday: 'short' }).replace(/\.$/, '');
}

/**
 * Long es-ES weekday plus day number: "jueves 17". Built manually because
 * Intl inserts a comma between weekday and day ("jueves, 17").
 */
export function formatLongDayName(isoDate: string): string {
  const date = parseIsoDate(isoDate);
  if (date === null) {
    return isoDate;
  }
  const weekday = date.toLocaleDateString('es-ES', { weekday: 'long' });
  return `${weekday} ${date.getDate()}`;
}
