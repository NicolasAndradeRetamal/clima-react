import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
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

function renderList(daily = dailyWithNulls, selectedDayIndex = 0, onSelectDay = vi.fn()) {
  render(
    <ForecastList daily={daily} selectedDayIndex={selectedDayIndex} onSelectDay={onSelectDay} />,
  );
  return { onSelectDay };
}

/** Day cards are the buttons inside the labelled day-selection group. */
function getDayCards(): HTMLElement[] {
  return within(
    screen.getByRole('group', { name: 'Selecciona un día para ver el detalle por horas' }),
  ).getAllByRole('button');
}

describe('ForecastList', () => {
  it('skips a day whose core daily cell is null instead of rendering 0°', () => {
    renderList();

    // Day 1 (weather_code: null) is omitted; the other two render normally.
    const days = getDayCards();
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
    renderList(dailyMissingToday);

    const days = getDayCards();
    expect(days).toHaveLength(2);
    // The first rendered card is tomorrow: it must keep its day name.
    expect(screen.queryByText('Hoy')).not.toBeInTheDocument();
    // 2026-07-09 is a Thursday.
    expect(within(days[0] as HTMLElement).getByText('jue')).toBeInTheDocument();
  });

  it('renders a day with null precipitation but hides the percentage', () => {
    renderList();

    const days = getDayCards();
    // Day 0 has precipitation_probability_max: null → no "%" text at all.
    expect(within(days[0] as HTMLElement).queryByText(/%/)).not.toBeInTheDocument();
    // Day 2 (rendered second) keeps its regular 90 %.
    expect(within(days[1] as HTMLElement).getByText('90 %')).toBeInTheDocument();
  });

  it('marks only the selected day with aria-pressed', () => {
    renderList(dailyWithNulls, 2);

    const days = getDayCards();
    expect(days[0]).toHaveAttribute('aria-pressed', 'false');
    expect(days[1]).toHaveAttribute('aria-pressed', 'true');
  });

  it('reports the ORIGINAL API index when a day is clicked, even after drops', async () => {
    const user = userEvent.setup();
    const { onSelectDay } = renderList();

    // Second rendered card is API day 2 (day 1 was dropped for null data).
    await user.click(getDayCards()[1] as HTMLElement);

    expect(onSelectDay).toHaveBeenCalledWith(2);
  });
});
