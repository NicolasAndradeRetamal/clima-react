import { describe, expect, it } from 'vitest';
import type { WeatherKind } from '../types/weather';
import { getWeatherCondition } from './weatherCodes';

describe('getWeatherCondition', () => {
  // One representative code per WMO group.
  it.each<[number, WeatherKind, string]>([
    [0, 'clear', 'Despejado'],
    [1, 'clear', 'Mayormente despejado'],
    [2, 'partly-cloudy', 'Parcialmente nublado'],
    [3, 'overcast', 'Nublado'],
    [45, 'fog', 'Niebla'],
    [53, 'drizzle', 'Llovizna'],
    [56, 'freezing-rain', 'Llovizna helada'],
    [63, 'rain', 'Lluvia'],
    [66, 'freezing-rain', 'Lluvia helada'],
    [73, 'snow', 'Nieve'],
    [81, 'showers', 'Chubascos'],
    [86, 'snow', 'Chubascos de nieve'],
    [95, 'thunderstorm', 'Tormenta'],
    [99, 'thunderstorm', 'Tormenta con granizo'],
  ])('maps WMO code %i to %s ("%s")', (code, kind, label) => {
    expect(getWeatherCondition(code)).toEqual({ kind, label });
  });

  it('falls back safely on unknown codes', () => {
    expect(getWeatherCondition(42)).toEqual({
      kind: 'overcast',
      label: 'Condición desconocida',
    });
  });
});
