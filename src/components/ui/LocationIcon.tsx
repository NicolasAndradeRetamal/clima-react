interface LocationIconProps {
  className?: string;
}

/** Map-pin glyph: geolocation banner button and "Tu ubicación" heading. */
export function LocationIcon({ className }: LocationIconProps) {
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
      <path d="M12 21.5S5.5 15.6 5.5 10.5a6.5 6.5 0 0 1 13 0c0 5.1-6.5 11-6.5 11Z" />
      <circle cx="12" cy="10.5" r="2.5" />
    </svg>
  );
}
