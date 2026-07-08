interface ErrorMessageProps {
  message: string;
  onRetry: () => void;
}

/** Error card with a retry action (weather load failure). */
export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-2xl border border-danger/30 bg-danger-soft px-6 py-10 text-center"
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
        className="size-8 text-danger"
      >
        <path d="M12 4 2.5 20h19Z" />
        <path d="M12 10.5v4" />
        <path d="M12 17.5v.01" />
      </svg>
      <p className="text-sm text-ink">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="h-10 rounded-lg bg-brand px-4 text-sm font-medium text-surface transition-colors hover:bg-brand-strong"
      >
        Reintentar
      </button>
    </div>
  );
}
