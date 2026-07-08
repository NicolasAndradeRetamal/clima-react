import type { ReactNode } from 'react';

interface EmptyStateProps {
  message: string;
  /** Decorative icon, sized by the caller (e.g. "size-10 text-ink-muted"). */
  icon?: ReactNode;
}

/** Dashed placeholder card for "nothing here yet" situations. */
export function EmptyState({ message, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line px-6 py-12 text-center">
      {icon}
      <p className="text-sm text-ink-muted">{message}</p>
    </div>
  );
}
