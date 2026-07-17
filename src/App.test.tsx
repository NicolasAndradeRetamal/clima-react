import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { App } from './App';
import { installGeolocationMock } from './test/mocks/geolocation';
import { renderWithQueryClient } from './test/utils';

/** jsdom does not react to real connectivity: spoof the readonly getter. */
function setNavigatorOnLine(value: boolean): void {
  Object.defineProperty(navigator, 'onLine', { value, configurable: true });
}

afterEach(() => {
  // Drop the own property so the pristine prototype getter takes over again.
  Reflect.deleteProperty(navigator, 'onLine');
});

describe('App (geolocation integration)', () => {
  it('shows no geolocation UI when the browser does not support it', () => {
    renderWithQueryClient(<App />);

    expect(screen.queryByRole('button', { name: 'Usar mi ubicación' })).not.toBeInTheDocument();
    expect(screen.getByText('Busca una ciudad para ver el clima')).toBeInTheDocument();
  });

  // Integration tests: geolocation microtasks + MSW fetch can exceed the
  // default 1 s findBy / 5 s test timeouts when the suite runs in parallel.
  const INTEGRATION_TIMEOUT = { timeout: 5000 };

  it(
    'auto-selects "Tu ubicación" when the permission is already granted',
    async () => {
      installGeolocationMock({
        permission: 'granted',
        position: { latitude: 40.4165, longitude: -3.7026 },
      });
      renderWithQueryClient(<App />);

      expect(
        await screen.findByRole('heading', { name: 'Tu ubicación' }, INTEGRATION_TIMEOUT),
      ).toBeInTheDocument();
      // Weather data comes from the MSW forecast fixture.
      expect(await screen.findByText('23°', undefined, INTEGRATION_TIMEOUT)).toBeInTheDocument();
      // The current position has no geocoding id: the favorite star must not exist.
      expect(
        screen.queryByRole('button', { name: 'Añadir a favoritas' }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Quitar de favoritas' }),
      ).not.toBeInTheDocument();
      // Once granted, the banner is gone.
      expect(screen.queryByRole('button', { name: 'Usar mi ubicación' })).not.toBeInTheDocument();
    },
    15_000,
  );

  it(
    'moves focus to the "Tu ubicación" heading after granting from the banner',
    async () => {
      installGeolocationMock({
        permission: 'prompt',
        position: { latitude: 40.4165, longitude: -3.7026 },
      });
      const user = userEvent.setup();
      renderWithQueryClient(<App />);

      // Granting unmounts the focused button; focus must land on the
      // heading instead of falling to <body>.
      await user.click(screen.getByRole('button', { name: 'Usar mi ubicación' }));

      const heading = await screen.findByRole(
        'heading',
        { name: 'Tu ubicación' },
        INTEGRATION_TIMEOUT,
      );
      await waitFor(() => {
        expect(heading).toHaveFocus();
      }, INTEGRATION_TIMEOUT);
    },
    15_000,
  );
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
