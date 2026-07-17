import type { ReactNode } from 'react';

interface SectionHeadingProps {
  children: ReactNode;
}

/** Shared section heading style ("Pronóstico de 7 días", hourly block, …). */
export function SectionHeading({ children }: SectionHeadingProps) {
  return (
    <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">{children}</h2>
  );
}
