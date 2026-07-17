import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { GeolocationBanner } from './GeolocationBanner';

describe('GeolocationBanner', () => {
  it('renders nothing when geolocation is unsupported or already granted', () => {
    const { container, rerender } = render(
      <GeolocationBanner status="unsupported" onRequestLocation={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();

    rerender(<GeolocationBanner status="granted" onRequestLocation={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('offers "Usar mi ubicación" when idle and requests on click', async () => {
    const onRequestLocation = vi.fn();
    const user = userEvent.setup();
    render(<GeolocationBanner status="idle" onRequestLocation={onRequestLocation} />);

    await user.click(screen.getByRole('button', { name: 'Usar mi ubicación' }));

    expect(onRequestLocation).toHaveBeenCalledTimes(1);
  });

  it('shows a disabled progress button while requesting', () => {
    render(<GeolocationBanner status="requesting" onRequestLocation={vi.fn()} />);

    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Obteniendo tu ubicación…');
    expect(screen.getByRole('button', { name: /Obteniendo tu ubicación/ })).toBeDisabled();
  });

  it('shows the denied notice and hides it after dismissing', async () => {
    const user = userEvent.setup();
    render(<GeolocationBanner status="denied" onRequestLocation={vi.fn()} />);

    expect(
      screen.getByText('Permiso de ubicación denegado. Puedes buscar tu ciudad manualmente.'),
    ).toBeInTheDocument();
    // No retry here: the permission is managed in the browser.
    expect(screen.queryByRole('button', { name: 'Reintentar' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Descartar aviso' }));

    expect(
      screen.queryByText('Permiso de ubicación denegado. Puedes buscar tu ciudad manualmente.'),
    ).not.toBeInTheDocument();
  });

  it('shows the error notice with a working "Reintentar" button', async () => {
    const onRequestLocation = vi.fn();
    const user = userEvent.setup();
    render(<GeolocationBanner status="error" onRequestLocation={onRequestLocation} />);

    expect(screen.getByText('No se pudo obtener tu ubicación.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    expect(onRequestLocation).toHaveBeenCalledTimes(1);
  });
});
