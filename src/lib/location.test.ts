import { describe, expect, it } from 'vitest';
import { madridCity } from '../test/mocks/fixtures';
import { cityToLocation, currentPositionToLocation } from './location';

describe('cityToLocation', () => {
  it('maps a city with admin1 into label + "admin1 · country" sublabel', () => {
    const location = cityToLocation(madridCity);

    expect(location).toEqual({
      latitude: madridCity.latitude,
      longitude: madridCity.longitude,
      label: 'Madrid',
      sublabel: 'Comunidad de Madrid · España',
      city: madridCity,
    });
  });

  it('falls back to the country alone when admin1 is missing', () => {
    const { sublabel } = cityToLocation({ ...madridCity, admin1: undefined });

    expect(sublabel).toBe('España');
  });
});

describe('currentPositionToLocation', () => {
  it('labels the position "Tu ubicación" with no sublabel and no city', () => {
    const location = currentPositionToLocation({ latitude: -12.04, longitude: -77.03 });

    expect(location).toEqual({
      latitude: -12.04,
      longitude: -77.03,
      label: 'Tu ubicación',
    });
    expect(location.city).toBeUndefined();
    expect(location.sublabel).toBeUndefined();
  });
});
