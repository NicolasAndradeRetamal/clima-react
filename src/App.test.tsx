import { act, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { App } from './App';
import { installGeolocationMock } from './test/mocks/geolocation';
import { renderWithQueryClient } from './test/utils';

/** jsdom does not react to real connectivity: spoof the readonly getter. */
function setNavigatorOnLine(value: boolean): void {
  Object.defineProperty(navigator, 'onLine', { value, configurable: true });
}

afterEach(() => {
  setNavigatorOnLine(true);
});

describe('App (geolocation integration)', () => {
  it('shows no geolocation UI when the browser does not support it', () => {
    renderWithQueryClient(<App />);

    expect(screen.queryByRole('button', { name: 'Usar mi ubicación' })).not.toBeInTheDocument();
    expect(screen.getByText('Busca una ciudad para ver el clima')).toBeInTheDocument();
  });

  it('auto-selects "Tu ubicación" when the permission is already granted', async () => {
    installGeolocationMock({
      permission: 'granted',
      position: { latitude: 40.4165, longitude: -3.7026 },
    });
    renderWithQueryClient(<App />);

    expect(await screen.findByRole('heading', { name: 'Tu ubicación' })).toBeInTheDocument();
    // Weather data comes from the MSW forecast fixture.
    expect(await screen.findByText('23°')).toBeInTheDocument();
    // The current position has no geocoding id: the favorite star must not exist.
    expect(screen.queryByRole('button', { name: 'Añadir a favoritas' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Quitar de favoritas' })).not.toBeInTheDocument();
    // Once granted, the banner is gone.
    expect(screen.queryByRole('button', { name: 'Usar mi ubicación' })).not.toBeInTheDocument();
  });
});

describe('App (offline banner)', () => {
  const OFFLINE_TEXT = 'Sin conexión. Se muestran los últimos datos disponibles.';

  it('shows the banner while offline and hides it on reconnection', () => {
    renderWithQueryClient(<App />);
    expect(screen.queryByText(OFFLINE_TEXT)).not.toBeInTheDocument();

    act(() => {
      setNavigatorOnLine(false);
      window.dispatchEvent(new Event('offline'));
    });
    expect(screen.getByText(OFFLINE_TEXT)).toBeInTheDocument();

    act(() => {
      setNavigatorOnLine(true);
      window.dispatchEvent(new Event('online'));
    });
    expect(screen.queryByText(OFFLINE_TEXT)).not.toBeInTheDocument();
  });
});
