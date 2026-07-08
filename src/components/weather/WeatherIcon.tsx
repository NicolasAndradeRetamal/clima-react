import type { ReactNode } from 'react';
import type { WeatherKind } from '../../types/weather';

interface WeatherIconProps {
  kind: WeatherKind;
  isDay: boolean;
  /** Size and color via Tailwind utilities, e.g. "size-16 text-brand". */
  className?: string;
}

/** Full cloud, flat base — the `overcast` glyph. */
const CLOUD_PATH = 'M17.5 18.5H9a6 6 0 1 1 5.74-7.7h2.76a3.85 3.85 0 1 1 0 7.7Z';

/** Raised cloud reused by every precipitation/fog glyph. */
const CLOUD_RAISED_PATH = 'M17.5 14.5H9a5.5 5.5 0 1 1 5.26-7.05h2.24a3.55 3.55 0 1 1 0 7.05Z';

/** Small cloud overlapping bottom-right for the partly-cloudy variants. */
const CLOUD_SMALL_PATH = 'M18 19.5h-7.5a5 5 0 1 1 4.78-6.4h2.72a3.2 3.2 0 1 1 0 6.4Z';

function Cloud({ path = CLOUD_RAISED_PATH }: { path?: string }) {
  return <path d={path} />;
}

/** Tiny 3-stroke snow/ice star centered at (cx, cy). */
function IceStar({ cx, cy }: { cx: number; cy: number }) {
  return (
    <>
      <path d={`M${cx} ${cy - 1.6}v3.2`} />
      <path d={`M${cx - 1.4} ${cy - 0.8}l2.8 1.6`} />
      <path d={`M${cx + 1.4} ${cy - 0.8}l-2.8 1.6`} />
    </>
  );
}

function getGlyph(kind: WeatherKind, isDay: boolean): ReactNode {
  switch (kind) {
    case 'clear':
      return isDay ? (
        <>
          <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </>
      ) : (
        <path
          d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"
          fill="currentColor"
          stroke="none"
        />
      );
    case 'partly-cloudy':
      return (
        <>
          {isDay ? (
            <>
              <circle cx="8" cy="8" r="2.8" fill="currentColor" stroke="none" />
              <path d="M8 2.5v1.7M2.5 8h1.7M3.9 3.9l1.2 1.2M12.1 3.9l-1.2 1.2" />
            </>
          ) : (
            <path
              d="M12.3 7.6A5 5 0 1 1 6.9 2.2a3.9 3.9 0 0 0 5.4 5.4Z"
              fill="currentColor"
              stroke="none"
            />
          )}
          <Cloud path={CLOUD_SMALL_PATH} />
        </>
      );
    case 'overcast':
      return <Cloud path={CLOUD_PATH} />;
    case 'fog':
      return (
        <>
          <Cloud />
          <path d="M6 18h9M9 21h9" />
        </>
      );
    case 'drizzle':
      return (
        <>
          <Cloud />
          <path d="M8.5 18v.01M12.5 20.5v.01M16.5 18v.01" />
        </>
      );
    case 'rain':
      return (
        <>
          <Cloud />
          <path d="M9.5 17.5 8.4 20.5M13.5 17.5l-1.1 3M17.5 17.5l-1.1 3" />
        </>
      );
    case 'freezing-rain':
      return (
        <>
          <Cloud />
          <path d="M8.5 17.5l-1.1 3M12.5 17.5l-1.1 3" />
          <IceStar cx={16.5} cy={19} />
        </>
      );
    case 'snow':
      return (
        <>
          <Cloud />
          <IceStar cx={8.5} cy={18} />
          <IceStar cx={15.5} cy={18} />
          <IceStar cx={12} cy={21} />
        </>
      );
    case 'showers':
      return (
        <>
          <Cloud />
          <path d="M10 16.5 8.2 21.5M14 16.5l-1.8 5M18 16.5l-1.8 5" />
        </>
      );
    case 'thunderstorm':
      return (
        <>
          <Cloud />
          <path
            d="M12.8 13.5 9.8 18h2.2l-1.5 4 4.7-6h-2.3l1.4-2.5Z"
            fill="currentColor"
            stroke="none"
          />
        </>
      );
  }
}

/**
 * Hand-written inline SVG glyph for a weather kind. Only `clear` and
 * `partly-cloudy` have night variants; other kinds ignore `isDay`.
 * Always decorative: meaning is conveyed by adjacent (sr-only) text.
 */
export function WeatherIcon({ kind, isDay, className }: WeatherIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {getGlyph(kind, isDay)}
    </svg>
  );
}
