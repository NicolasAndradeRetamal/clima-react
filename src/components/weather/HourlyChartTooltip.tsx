import type { TooltipContentProps } from 'recharts';
import { formatPercent, formatPrecipitation, formatTemperature } from '../../lib/format';
import type { HourlyPoint } from '../../lib/hourly';

/** Recharts injects these into the custom tooltip content element. */
type HourlyChartTooltipProps = Partial<Pick<TooltipContentProps<number, string>, 'active' | 'payload'>>;

interface TooltipRowProps {
  label: string;
  value: string;
  /** Swatch classes mirroring the series shape; omitted for non-series rows. */
  swatchClassName?: string;
}

function TooltipRow({ label, value, swatchClassName }: TooltipRowProps) {
  return (
    <p className="flex items-center gap-1.5 text-xs text-ink-muted">
      {swatchClassName !== undefined && <span aria-hidden="true" className={swatchClassName} />}
      {label}: <span className="font-medium text-ink tabular-nums">{value}</span>
    </p>
  );
}

/** Spanish tooltip for the hourly chart: hour, temperature, precipitation. */
export function HourlyChartTooltip({ active, payload }: HourlyChartTooltipProps) {
  // Recharts types the datum as `any`; it is always an HourlyPoint here
  // because the chart is fed `data={points}` (see HourlyChart).
  const point = payload?.[0]?.payload as HourlyPoint | undefined;
  if (active !== true || point === undefined) {
    return null;
  }
  const { temperature, precipitation, precipitationProbability } = point;
  if (temperature === null && precipitation === null && precipitationProbability === null) {
    return null;
  }

  return (
    <div className="rounded-lg border border-line bg-surface-raised px-3 py-2 shadow-lg">
      <p className="text-xs font-semibold text-ink tabular-nums">{point.hourLabel}</p>
      {temperature !== null && (
        <TooltipRow
          label="Temperatura"
          value={formatTemperature(temperature)}
          swatchClassName="size-2 rounded-full bg-chart-temp"
        />
      )}
      {precipitation !== null && (
        <TooltipRow
          label="Precipitación"
          value={formatPrecipitation(precipitation)}
          swatchClassName="size-2 rounded-xs bg-brand/50"
        />
      )}
      {precipitationProbability !== null && (
        <TooltipRow label="Prob. de lluvia" value={formatPercent(precipitationProbability)} />
      )}
    </div>
  );
}
