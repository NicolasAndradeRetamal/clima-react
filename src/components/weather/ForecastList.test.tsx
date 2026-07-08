import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { DailyForecast } from '../../types/forecast';
import { ForecastList } from './ForecastList';

/** Open-Meteo can emit `null` in daily cells without data (QA LOW-2). */
const dailyWithNulls: DailyForecast = {
  time: ['2026-07-08', '2026-07-09', '2026-07-10'],
  weather_code: [2, null, 0],
  temperature_2m_max: [26.1, 27.8, 24.9],
  temperature_2m_min: [12.1, 13.4, 11.9],
  precipitation_probability_max: [null, 40, 90],
};

describe('ForecastList', () => {
  it('skips a day whose core daily cell is null instead of rendering 0°', () => {
    render(<ForecastList daily={dailyWithNulls} />);

    // Day 1 (weather_code: null) is omitted; the other two render normally.
    const days = screen.getAllByRole('listitem');
    expect(days).toHaveLength(2);
    expect(within(days[0] as HTMLElement).getByText('Hoy')).toBeInTheDocument();
    expect(within(days[0] as HTMLElement).getByText('26°')).toBeInTheDocument();
    expect(within(days[1] as HTMLElement).getByText('25°')).toBeInTheDocument();
    expect(screen.queryByText('0°')).not.toBeInTheDocument();
  });

  it('does not label tomorrow as "Hoy" when today is dropped for null data', () => {
    const dailyMissingToday: DailyForecast = {
      ...dailyWithNulls,
      // Day 0 (today) has no weather code → it is dropped entirely.
      weather_code: [null, 3, 0],
    };
    render(<ForecastList daily={dailyMissingToday} />);

    const days = screen.getAllByRole('listitem');
    expect(days).toHaveLength(2);
    // The first rendered card is tomorrow: it must keep its day name.
    expect(screen.queryByText('Hoy')).not.toBeInTheDocument();
    // 2026-07-09 is a Thursday.
    expect(within(days[0] as HTMLElement).getByText('jue')).toBeInTheDocument();
  });

  it('renders a day with null precipitation but hides the percentage', () => {
    render(<ForecastList daily={dailyWithNulls} />);

    const days = screen.getAllByRole('listitem');
    // Day 0 has precipitation_probability_max: null → no "%" text at all.
    expect(within(days[0] as HTMLElement).queryByText(/%/)).not.toBeInTheDocument();
    // Day 2 (rendered second) keeps its regular 90 %.
    expect(within(days[1] as HTMLElement).getByText('90 %')).toBeInTheDocument();
  });
});
