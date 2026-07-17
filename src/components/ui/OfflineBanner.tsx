/**
 * Full-width neutral strip shown while offline (not an error: cached data is
 * still valid). Sticky so it pushes content instead of covering it.
 */
export function OfflineBanner() {
  return (
    <div
      role="status"
      className="sticky top-0 z-20 border-b border-line bg-surface-sunken px-4 py-2 text-center text-sm text-ink"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
        className="mr-1.5 inline size-4 align-[-0.2em]"
      >
        <path d="M17.5 16.5H9a5.5 5.5 0 1 1 5.26-7.05h2.24a3.55 3.55 0 1 1 0 7.05Z" />
        <path d="m4 4 16 16" />
      </svg>
      Sin conexión. Se muestran los últimos datos disponibles.
    </div>
  );
}
