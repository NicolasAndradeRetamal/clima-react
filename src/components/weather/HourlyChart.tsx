import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { HourlyPoint } from '../../lib/hourly';
import type { HourlyForecastUnits } from '../../types/forecast';
import { SectionHeading } from '../ui/SectionHeading';
import { HourlyChartTooltip } from './HourlyChartTooltip';

interface HourlyChartProps {
  points: HourlyPoint[];
  units: HourlyForecastUnits;
  /** Section heading, e.g. "Pronóstico por horas · jueves 17". */
  title: string;
}

const AXIS_TICK_STYLE = { fill: 'var(--color-ink-muted)', fontSize: 12 };

/** "14:00" → "14" so 8 ticks fit a 320 px viewport. */
function toShortHour(hourLabel: string): string {
  return hourLabel.slice(0, 2);
}

/**
 * Temperature line + precipitation bars for one day, with a custom tooltip.
 * Presentational only; lazy-loaded so recharts stays out of the entry chunk
 * (default export required by `React.lazy`).
 */
export default function HourlyChart({ points, units, title }: HourlyChartProps) {
  return (
    <section>
      <SectionHeading>{title}</SectionHeading>
      <div className="mt-3 rounded-2xl border border-line bg-surface-raised p-4 shadow-sm sm:p-6">
        <div
          role="img"
          aria-label="Gráfico de temperatura y precipitación por horas"
          className="h-56 md:h-64"
        >
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={points} margin={{ top: 8, right: 0, bottom: 0, left: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--color-line)" strokeDasharray="3 3" />
              <XAxis
                dataKey="hourLabel"
                interval={2}
                tickFormatter={toShortHour}
                tick={AXIS_TICK_STYLE}
                axisLine={{ stroke: 'var(--color-line)' }}
                tickLine={false}
              />
              <YAxis
                yAxisId="temperature"
                width={32}
                tickFormatter={(value: number) => `${value}°`}
                tick={AXIS_TICK_STYLE}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="precipitation"
                orientation="right"
                width={32}
                domain={[0, 'auto']}
                tick={AXIS_TICK_STYLE}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={<HourlyChartTooltip />}
                cursor={{ stroke: 'var(--color-line)' }}
              />
              <Bar
                yAxisId="precipitation"
                dataKey="precipitation"
                fill="var(--color-brand)"
                fillOpacity={0.5}
                radius={[2, 2, 0, 0]}
                isAnimationActive={false}
              />
              <Line
                yAxisId="temperature"
                type="monotone"
                dataKey="temperature"
                stroke="var(--color-chart-temp)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
                connectNulls={false}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted">
          <span className="flex items-center gap-1.5">
            <span aria-hidden="true" className="size-2.5 rounded-full bg-chart-temp" />
            Temperatura ({units.temperature_2m})
          </span>
          <span className="flex items-center gap-1.5">
            <span aria-hidden="true" className="size-2.5 rounded-xs bg-brand/50" />
            Precipitación ({units.precipitation})
          </span>
        </div>
      </div>
    </section>
  );
}
