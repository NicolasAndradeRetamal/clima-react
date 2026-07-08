interface FavoriteToggleButtonProps {
  isFavorite: boolean;
  onToggle: () => void;
}

/** Star toggle shown in the current-weather card header. */
export function FavoriteToggleButton({ isFavorite, onToggle }: FavoriteToggleButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={isFavorite}
      aria-label={isFavorite ? 'Quitar de favoritas' : 'Añadir a favoritas'}
      onClick={onToggle}
      className="inline-flex size-10 items-center justify-center rounded-full transition-colors hover:bg-brand-soft"
    >
      <svg
        viewBox="0 0 24 24"
        fill={isFavorite ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
        className={`size-6 ${isFavorite ? 'text-accent' : 'text-ink-muted'}`}
      >
        <path d="m12 3.5 2.61 5.28 5.83.85-4.22 4.11 1 5.81L12 16.81l-5.22 2.74 1-5.81-4.22-4.11 5.83-.85Z" />
      </svg>
    </button>
  );
}
