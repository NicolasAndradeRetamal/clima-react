import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { madridCity } from '../../test/mocks/fixtures';
import { FORECAST_URL, server } from '../../test/mocks/handlers';
import { renderWithQueryClient } from '../../test/utils';
import { WeatherPanel } from './WeatherPanel';

function renderPanel(city = madridCity, onToggleFavorite = vi.fn()) {
  return renderWithQueryClient(
    <WeatherPanel city={city} isFavorite={() => false} onToggleFavorite={onToggleFavorite} />,
  );
}

describe('WeatherPanel', () => {
  it('shows the empty state when no city is selected', () => {
    renderWithQueryClient(
      <WeatherPanel city={null} isFavorite={() => false} onToggleFavorite={vi.fn()} />,
    );

    expect(screen.getByText('Busca una ciudad para ver el clima')).toBeInTheDocument();
  });

  it('shows a loading skeleton while the forecast is pending', () => {
    renderPanel();

    expect(screen.getByText('Cargando el clima…')).toBeInTheDocument();
  });

  it('renders current weather: temperature, feels-like, wind and humidity', async () => {
    renderPanel();

    // 23.4 °C → "23°" (unique to the current temperature in the fixture).
    expect(await screen.findByText('23°')).toBeInTheDocument();
    expect(screen.getByText('Sensación térmica: 25°')).toBeInTheDocument();
    expect(screen.getByText('Viento')).toBeInTheDocument();
    expect(screen.getByText('14 km/h')).toBeInTheDocument();
    expect(screen.getByText('Humedad')).toBeInTheDocument();
    expect(screen.getByText('62 %')).toBeInTheDocument();
    const heading = screen.getByRole('heading', { name: 'Madrid' });
    const card = within(heading.closest('section') as HTMLElement);
    expect(card.getByText('Parcialmente nublado')).toBeInTheDocument();
  });

  it('renders 7 forecast day cards with day names and temperatures', async () => {
    renderPanel();

    const list = within(
      (await screen.findByRole('heading', { name: 'Pronóstico de 7 días' }))
        .closest('section') as HTMLElement,
    );
    const days = list.getAllByRole('listitem');
    expect(days).toHaveLength(7);

    expect(within(days[0] as HTMLElement).getByText('Hoy')).toBeInTheDocument();
    expect(within(days[0] as HTMLElement).getByText('26°')).toBeInTheDocument();
    expect(within(days[0] as HTMLElement).getByText('12°')).toBeInTheDocument();
    // 2026-07-09 is a Thursday.
    expect(within(days[1] as HTMLElement).getByText('jue')).toBeInTheDocument();
    // Precipitation shown only when >= 20 %: day 4 has 90 %.
    expect(within(days[4] as HTMLElement).getByText('90 %')).toBeInTheDocument();
    expect(within(days[0] as HTMLElement).queryByText('10 %')).not.toBeInTheDocument();
  });

  it('shows the error card on network failure and recovers via "Reintentar"', async () => {
    server.use(http.get(FORECAST_URL, () => HttpResponse.error(), { once: true }));
    const user = userEvent.setup();
    renderPanel();

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(
      'No se pudo cargar el clima. Comprueba tu conexión e inténtalo de nuevo.',
    );

    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    expect(await screen.findByText('23°')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows the error card on an API error (HTTP 400)', async () => {
    server.use(
      http.get(FORECAST_URL, () =>
        HttpResponse.json({ error: true, reason: 'Invalid latitude' }, { status: 400 }),
      ),
    );
    renderPanel();

    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });

  it('toggles the favorite star from the card header', async () => {
    const onToggleFavorite = vi.fn();
    const user = userEvent.setup();
    renderPanel(madridCity, onToggleFavorite);

    await user.click(await screen.findByRole('button', { name: 'Añadir a favoritas' }));

    expect(onToggleFavorite).toHaveBeenCalledWith(madridCity);
  });
});
