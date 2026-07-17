import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { OfflineBanner } from './OfflineBanner';

describe('OfflineBanner', () => {
  it('renders the offline notice as a polite status region', () => {
    render(<OfflineBanner />);

    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Sin conexión. Se muestran los últimos datos disponibles.');
  });
});
