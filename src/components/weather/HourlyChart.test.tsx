import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { selectHourlyForDay } from '../../lib/hourly';
import { madridForecastResponse } from '../../test/mocks/fixtures';
import HourlyChart from './HourlyChart';

/**
 * Smoke test only: title, accessible region and legend. The SVG internals
 * (paths, layout) belong to recharts and are not asserted. The global
 * ResizeObserver mock (test/setup.ts) reports a fixed non-zero size so
 * ResponsiveContainer actually renders in jsdom.
 */
describe('HourlyChart', () => {
  const points = selectHourlyForDay(madridForecastResponse.hourly, '2026-07-08');

  it('renders the title, the accessible chart region and the legend', () => {
    render(
      <HourlyChart
        points={points}
        units={madridForecastResponse.hourly_units}
        title="Pronóstico por horas · hoy"
      />,
    );

    expect(points).toHaveLength(24);
    expect(
      screen.getByRole('heading', { name: 'Pronóstico por horas · hoy' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('img', { name: 'Gráfico de temperatura y precipitación por horas' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Temperatura (°C)')).toBeInTheDocument();
    expect(screen.getByText('Precipitación (mm)')).toBeInTheDocument();
  });
});
