interface SpinnerProps {
  /** Size and color via Tailwind utilities, e.g. "size-5 text-ink-muted". */
  className?: string;
}

/**
 * Decorative spinning circle. Callers must wrap it in a `role="status"`
 * element with `sr-only` Spanish text (see DESIGN.md §4.6).
 */
export function Spinner({ className }: SpinnerProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={`animate-spin ${className ?? ''}`}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" className="opacity-25" />
      <path d="M12 3a9 9 0 0 1 9 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
