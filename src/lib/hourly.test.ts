import { describe, expect, it } from 'vitest';
import type { HourlyForecast } from '../types/forecast';
import { selectHourlyForDay } from './hourly';

/** Two short "days" (3 hours each) plus a null cell in the middle. */
const hourly: HourlyForecast = {
  time: [
    '2026-07-08T00:00',
    '2026-07-08T01:00',
    '2026-07-08T02:00',
    '2026-07-14T22:00',
    '2026-07-14T23:00',
  ],
  temperature_2m: [15.2, null, 14.1, 20.4, 19.8],
  precipitation: [0, 1.2, null, 0, 0.4],
  precipitation_probability: [10, 40, 20, null, 5],
};

describe('selectHourlyForDay', () => {
  it('extracts only the points of the requested day (first day)', () => {
    const points = selectHourlyForDay(hourly, '2026-07-08');

    expect(points).toHaveLength(3);
    expect(points.map((point) => point.time)).toEqual([
      '2026-07-08T00:00',
      '2026-07-08T01:00',
      '2026-07-08T02:00',
    ]);
    expect(points[0]?.temperature).toBe(15.2);
    expect(points[0]?.precipitation).toBe(0);
    expect(points[0]?.precipitationProbability).toBe(10);
  });

  it('extracts the last day too (no index arithmetic involved)', () => {
    const points = selectHourlyForDay(hourly, '2026-07-14');

    expect(points).toHaveLength(2);
    expect(points[0]?.hourLabel).toBe('22:00');
    expect(points[1]?.temperature).toBe(19.8);
  });

  it('preserves nulls as nulls (chart gaps), never coercing to 0', () => {
    const points = selectHourlyForDay(hourly, '2026-07-08');

    expect(points[1]?.temperature).toBeNull();
    expect(points[2]?.precipitation).toBeNull();
    // The last-day point with a null probability keeps it null as well.
    expect(selectHourlyForDay(hourly, '2026-07-14')[0]?.precipitationProbability).toBeNull();
  });

  it('returns an empty array for a date with no hourly entries', () => {
    expect(selectHourlyForDay(hourly, '2026-07-20')).toEqual([]);
  });

  it('derives hourLabel from the time part of the ISO timestamp', () => {
    const points = selectHourlyForDay(hourly, '2026-07-08');

    expect(points.map((point) => point.hourLabel)).toEqual(['00:00', '01:00', '02:00']);
  });

  it('does not match a longer date sharing the prefix (e.g. "2026-07-1")', () => {
    expect(selectHourlyForDay(hourly, '2026-07-1')).toEqual([]);
  });
});
