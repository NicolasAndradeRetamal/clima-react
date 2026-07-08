import { describe, expect, it } from 'vitest';
import { formatDayName, formatPercent, formatTemperature, formatWind } from './format';

describe('formatTemperature', () => {
  it('rounds to the nearest integer and appends the degree sign', () => {
    expect(formatTemperature(23.4)).toBe('23°');
    expect(formatTemperature(24.6)).toBe('25°');
    expect(formatTemperature(12)).toBe('12°');
  });

  it('handles negative values and values around zero', () => {
    expect(formatTemperature(-3.6)).toBe('-4°');
    expect(formatTemperature(-0.2)).toBe('0°');
  });
});

describe('formatWind', () => {
  it('rounds and appends km/h', () => {
    expect(formatWind(14.2)).toBe('14 km/h');
    expect(formatWind(0)).toBe('0 km/h');
  });
});

describe('formatPercent', () => {
  it('rounds and appends the percent sign', () => {
    expect(formatPercent(61.5)).toBe('62 %');
    expect(formatPercent(0)).toBe('0 %');
  });
});

describe('formatDayName', () => {
  it('returns the short es-ES weekday name', () => {
    expect(formatDayName('2026-07-08')).toBe('mié'); // Wednesday
    expect(formatDayName('2026-07-09')).toBe('jue');
    expect(formatDayName('2026-07-12')).toBe('dom');
  });

  it('returns the input unchanged when the date is malformed', () => {
    expect(formatDayName('not-a-date')).toBe('not-a-date');
  });
});
