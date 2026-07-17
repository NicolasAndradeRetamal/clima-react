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

  it('keeps the same focused button when idle turns to requesting', async () => {
    const onRequestLocation = vi.fn();
    const user = userEvent.setup();
    const { rerender } = render(
      <GeolocationBanner status="idle" onRequestLocation={onRequestLocation} />,
    );
    const idleButton = screen.getByRole('button', { name: 'Usar mi ubicación' });
    idleButton.focus();

    rerender(<GeolocationBanner status="requesting" onRequestLocation={onRequestLocation} />);

    // Same element, never remounted: keyboard focus survives (WCAG 2.4.3).
    const requestingButton = screen.getByRole('button', { name: /Obteniendo tu ubicación/ });
    expect(requestingButton).toBe(idleButton);
    expect(requestingButton).toHaveFocus();
    expect(screen.getByRole('status')).toHaveTextContent('Obteniendo tu ubicación…');
    // aria-disabled + onClick guard, never the `disabled` attribute.
    expect(requestingButton).toHaveAttribute('aria-disabled', 'true');
    expect(requestingButton).toBeEnabled();
    await user.click(requestingButton);
    expect(onRequestLocation).not.toHaveBeenCalled();
  });

  it('moves focus to "Reintentar" when the request fails with focus on the button', () => {
    const { rerender } = render(
      <GeolocationBanner status="requesting" onRequestLocation={vi.fn()} />,
    );
    screen.getByRole('button', { name: /Obteniendo tu ubicación/ }).focus();

    rerender(<GeolocationBanner status="error" onRequestLocation={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Reintentar' })).toHaveFocus();
  });

  it('moves focus to the dismiss button when the permission is denied', () => {
    const { rerender } = render(
      <GeolocationBanner status="requesting" onRequestLocation={vi.fn()} />,
    );
    screen.getByRole('button', { name: /Obteniendo tu ubicación/ }).focus();

    rerender(<GeolocationBanner status="denied" onRequestLocation={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Descartar aviso' })).toHaveFocus();
  });

  it('hands focus off to the parent when granted with focus on the button', () => {
    const onGrantedFocusHandoff = vi.fn();
    const { rerender } = render(
      <GeolocationBanner
        status="requesting"
        onRequestLocation={vi.fn()}
        onGrantedFocusHandoff={onGrantedFocusHandoff}
      />,
    );
    screen.getByRole('button', { name: /Obteniendo tu ubicación/ }).focus();

    rerender(
      <GeolocationBanner
        status="granted"
        onRequestLocation={vi.fn()}
        onGrantedFocusHandoff={onGrantedFocusHandoff}
      />,
    );

    expect(onGrantedFocusHandoff).toHaveBeenCalledTimes(1);
  });

  it('never moves focus if it was outside the banner during the request', () => {
    const onGrantedFocusHandoff = vi.fn();
    const { rerender } = render(
      <GeolocationBanner
        status="requesting"
        onRequestLocation={vi.fn()}
        onGrantedFocusHandoff={onGrantedFocusHandoff}
      />,
    );

    rerender(
      <GeolocationBanner
        status="error"
        onRequestLocation={vi.fn()}
        onGrantedFocusHandoff={onGrantedFocusHandoff}
      />,
    );

    expect(screen.getByRole('button', { name: 'Reintentar' })).not.toHaveFocus();
    expect(onGrantedFocusHandoff).not.toHaveBeenCalled();
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
