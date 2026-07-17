import { useState, type ReactNode } from 'react';
import type { GeolocationStatus } from '../../hooks/useGeolocation';
import { LocationIcon } from '../ui/LocationIcon';
import { Spinner } from '../ui/Spinner';

function InfoIcon({ className }: { className?: string }) {
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
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" />
      <path d="M12 8v.01" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
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
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

/** Neutral info row shared by the `denied` and `error` states. */
function InfoRow({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-10 items-center gap-2 rounded-lg bg-surface-sunken px-3 py-2 text-sm text-ink-muted">
      <InfoIcon className="size-5 shrink-0" />
      {children}
    </div>
  );
}

interface GeolocationBannerProps {
  status: GeolocationStatus;
  onRequestLocation: () => void;
}

/**
 * Light row offering the current position as an alternative selection
 * (DESIGN.md §9.1). Never blocks manual search; disappears entirely when
 * geolocation is unsupported or already granted.
 */
export function GeolocationBanner({ status, onRequestLocation }: GeolocationBannerProps) {
  // Dismissing the "denied" notice hides it for the session (local state).
  const [dismissed, setDismissed] = useState(false);

  if (status === 'unsupported' || status === 'granted') {
    return null;
  }

  if (status === 'idle') {
    return (
      <button
        type="button"
        onClick={onRequestLocation}
        className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border border-line bg-surface-raised px-4 text-sm font-medium text-brand transition-colors hover:bg-brand-soft"
      >
        <LocationIcon className="size-5" />
        Usar mi ubicación
      </button>
    );
  }

  if (status === 'requesting') {
    return (
      <div role="status" className="min-h-10">
        <button
          type="button"
          disabled
          className="inline-flex h-10 items-center gap-2 rounded-full border border-line bg-surface-raised px-4 text-sm font-medium text-brand disabled:pointer-events-none disabled:opacity-60"
        >
          <Spinner className="size-4" />
          Obteniendo tu ubicación…
        </button>
      </div>
    );
  }

  if (status === 'denied') {
    if (dismissed) {
      return null;
    }
    return (
      <InfoRow>
        <p>Permiso de ubicación denegado. Puedes buscar tu ciudad manualmente.</p>
        <button
          type="button"
          aria-label="Descartar aviso"
          onClick={() => {
            setDismissed(true);
          }}
          className="ml-auto inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-brand-soft"
        >
          <CloseIcon className="size-4" />
        </button>
      </InfoRow>
    );
  }

  // status === 'error'
  return (
    <InfoRow>
      <p>No se pudo obtener tu ubicación.</p>
      <button
        type="button"
        onClick={onRequestLocation}
        className="ml-auto h-10 shrink-0 cursor-pointer rounded-lg px-3 text-sm font-medium text-brand transition-colors hover:bg-brand-soft"
      >
        Reintentar
      </button>
    </InfoRow>
  );
}
