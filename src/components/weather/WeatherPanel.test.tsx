import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { cityToLocation } from '../../lib/location';
import { madridCity, madridForecastResponse } from '../../test/mocks/fixtures';
import { FORECAST_URL, server } from '../../test/mocks/handlers';
import { renderWithQueryClient } from '../../test/utils';
import type { City } from '../../types/weather';
import { WeatherPanel } from './WeatherPanel';

function renderPanel(city = madridCity, onToggleFavorite = vi.fn()) {
  return renderWithQueryClient(
    <WeatherPanel
      location={cityToLocation(city)}
      isFavorite={() => false}
      onToggleFavorite={onToggleFavorite}
    />,
  );
}

/** Day cards are the buttons inside the labelled day-selection group. */
async function findDayCards(): Promise<HTMLElement[]> {
  const group = await screen.findByRole('group', {
    name: 'Selecciona un día para ver el detalle por horas',
  });
  return within(group).getAllByRole('button');
}

describe('WeatherPanel', () => {
  it('shows the empty state when no city is selected', () => {
    renderWithQueryClient(
      <WeatherPanel location={null} isFavorite={() => false} onToggleFavorite={vi.fn()} />,
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

    const days = await findDayCards();
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

  it('selects today by default and renders the hourly chart for it', async () => {
    renderPanel();

    const days = await findDayCards();
    expect(days[0]).toHaveAttribute('aria-pressed', 'true');
    expect(days[1]).toHaveAttribute('aria-pressed', 'false');
    expect(
      await screen.findByRole('heading', { name: 'Pronóstico por horas · hoy' }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('img', {
        name: 'Gráfico de temperatura y precipitación por horas',
      }),
    ).toBeInTheDocument();
  });

  it('updates aria-pressed and the hourly heading when another day is clicked', async () => {
    const user = userEvent.setup();
    renderPanel();

    const days = await findDayCards();
    await user.click(days[1] as HTMLElement);

    expect(days[1]).toHaveAttribute('aria-pressed', 'true');
    expect(days[0]).toHaveAttribute('aria-pressed', 'false');
    // 2026-07-09 is Thursday the 9th.
    expect(
      await screen.findByRole('heading', { name: 'Pronóstico por horas · jueves 9' }),
    ).toBeInTheDocument();
  });

  it('resets the selected day to today when the city changes', async () => {
    const user = userEvent.setup();
    const { rerender } = renderPanel();

    await user.click((await findDayCards())[2] as HTMLElement);
    expect(
      await screen.findByRole('heading', { name: 'Pronóstico por horas · viernes 10' }),
    ).toBeInTheDocument();

    const lima: City = {
      id: 3936456,
      name: 'Lima',
      country: 'Perú',
      countryCode: 'PE',
      latitude: -12.0432,
      longitude: -77.0282,
    };
    rerender(
      <WeatherPanel
        location={cityToLocation(lima)}
        isFavorite={() => false}
        onToggleFavorite={vi.fn()}
      />,
    );

    expect(
      await screen.findByRole('heading', { name: 'Pronóstico por horas · hoy' }),
    ).toBeInTheDocument();
    expect((await findDayCards())[0]).toHaveAttribute('aria-pressed', 'true');
  });

  it('shows the hourly empty state when the selected day has no hourly data', async () => {
    const response = structuredClone(madridForecastResponse);
    // Null out every hourly cell of today (24 first entries, selected by
    // default): the chart has nothing to draw.
    for (let hour = 0; hour < 24; hour += 1) {
      response.hourly.temperature_2m[hour] = null;
      response.hourly.precipitation[hour] = null;
      response.hourly.precipitation_probability[hour] = null;
    }
    server.use(http.get(FORECAST_URL, () => HttpResponse.json(response), { once: true }));
    renderPanel();

    expect(await screen.findByText('Sin datos horarios para este día')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Pronóstico por horas · hoy' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('img', { name: 'Gráfico de temperatura y precipitación por horas' }),
    ).not.toBeInTheDocument();
  });

  it('selects the first rendered day when today is dropped for missing data', async () => {
    const response = structuredClone(madridForecastResponse);
    response.daily.weather_code[0] = null; // today gets dropped by toForecastDays
    server.use(http.get(FORECAST_URL, () => HttpResponse.json(response), { once: true }));
    renderPanel();

    const days = await findDayCards();
    expect(days).toHaveLength(6);
    // The selection starts on the first day actually rendered (API index 1),
    // never orphaned on the dropped index 0.
    expect(days[0]).toHaveAttribute('aria-pressed', 'true');
    expect(
      await screen.findByRole('heading', { name: 'Pronóstico por horas · jueves 9' }),
    ).toBeInTheDocument();
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
