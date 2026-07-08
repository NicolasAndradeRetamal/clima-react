import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { GEOCODING_SEARCH_URL, server } from '../../test/mocks/handlers';
import { renderWithQueryClient } from '../../test/utils';
import { CitySearch } from './CitySearch';

function getSearchInput(): HTMLElement {
  return screen.getByRole('combobox', { name: 'Buscar ciudad' });
}

describe('CitySearch', () => {
  it('shows suggestions after typing at least 2 characters', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<CitySearch onSelectCity={vi.fn()} />);

    await user.type(getSearchInput(), 'mad');

    const options = await screen.findAllByRole('option');
    expect(options).toHaveLength(2);
    expect(options[0]).toHaveTextContent('Madrid');
    expect(screen.getByText('Comunidad de Madrid · España')).toBeInTheDocument();
    expect(screen.getByRole('listbox', { name: 'Ciudades sugeridas' })).toBeInTheDocument();
  });

  it('selects a city on click, clears the input and closes the dropdown', async () => {
    const user = userEvent.setup();
    const onSelectCity = vi.fn();
    renderWithQueryClient(<CitySearch onSelectCity={onSelectCity} />);

    await user.type(getSearchInput(), 'mad');
    await user.click(await screen.findByRole('option', { name: /^Madrid Comunidad/ }));

    expect(onSelectCity).toHaveBeenCalledTimes(1);
    expect(onSelectCity).toHaveBeenCalledWith(
      expect.objectContaining({ id: 3117735, name: 'Madrid', countryCode: 'ES' }),
    );
    expect(getSearchInput()).toHaveValue('');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('supports keyboard navigation: ArrowDown + Enter selects the highlighted option', async () => {
    const user = userEvent.setup();
    const onSelectCity = vi.fn();
    renderWithQueryClient(<CitySearch onSelectCity={onSelectCity} />);

    await user.type(getSearchInput(), 'mad');
    await screen.findAllByRole('option');

    await user.keyboard('{ArrowDown}{ArrowDown}{Enter}');

    expect(onSelectCity).toHaveBeenCalledWith(
      expect.objectContaining({ id: 2514392, name: 'Madridejos' }),
    );
  });

  it('closes the dropdown with Escape', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<CitySearch onSelectCity={vi.fn()} />);

    await user.type(getSearchInput(), 'mad');
    await screen.findByRole('listbox');

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('only sets aria-controls while the listbox is rendered', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<CitySearch onSelectCity={vi.fn()} />);

    // Closed dropdown: the referenced <ul> does not exist, so no aria-controls.
    const input = getSearchInput();
    expect(input).not.toHaveAttribute('aria-controls');

    await user.type(input, 'mad');
    await screen.findByRole('listbox');
    expect(input).toHaveAttribute('aria-controls', 'city-search-listbox');

    await user.keyboard('{Escape}');
    expect(input).not.toHaveAttribute('aria-controls');
  });

  it('does not set aria-controls on the "no results" row (not a listbox)', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<CitySearch onSelectCity={vi.fn()} />);

    await user.type(getSearchInput(), 'xyz');
    await screen.findByText('No se encontraron ciudades para «xyz»');

    expect(getSearchInput()).not.toHaveAttribute('aria-controls');
  });

  it('shows the "no results" message for an unknown city', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<CitySearch onSelectCity={vi.fn()} />);

    await user.type(getSearchInput(), 'xyz');

    expect(
      await screen.findByText('No se encontraron ciudades para «xyz»'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('option')).not.toBeInTheDocument();
  });

  it('shows the search error message on network failure', async () => {
    server.use(http.get(GEOCODING_SEARCH_URL, () => HttpResponse.error()));
    const user = userEvent.setup();
    renderWithQueryClient(<CitySearch onSelectCity={vi.fn()} />);

    await user.type(getSearchInput(), 'mad');

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('No se pudo buscar. Revisa tu conexión.');
  });

  it('does not query for fewer than 2 characters', async () => {
    const requestSpy = vi.fn();
    server.use(
      http.get(GEOCODING_SEARCH_URL, () => {
        requestSpy();
        return HttpResponse.json({ generationtime_ms: 0.1 });
      }),
    );
    const user = userEvent.setup();
    renderWithQueryClient(<CitySearch onSelectCity={vi.fn()} />);

    await user.type(getSearchInput(), 'm');

    // Wait past the 300 ms debounce window before asserting nothing fired.
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
    await new Promise((resolve) => setTimeout(resolve, 400));
    expect(requestSpy).not.toHaveBeenCalled();
  });
});
