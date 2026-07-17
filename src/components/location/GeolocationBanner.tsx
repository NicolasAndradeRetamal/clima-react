import { useEffect, useRef, useState, type ReactNode } from 'react';
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
  /**
   * Called when the permission is granted while keyboard focus was on the
   * banner button (which unmounts with the banner). The parent moves focus
   * to the "Tu ubicación" heading once it renders (DESIGN.md §9.1/§9.3).
   */
  onGrantedFocusHandoff?: () => void;
}

/**
 * Light row offering the current position as an alternative selection
 * (DESIGN.md §9.1). Never blocks manual search; disappears entirely when
 * geolocation is unsupported or already granted.
 */
export function GeolocationBanner({
  status,
  onRequestLocation,
  onGrantedFocusHandoff,
}: GeolocationBannerProps) {
  // Dismissing the "denied" notice hides it for the session (local state).
  const [dismissed, setDismissed] = useState(false);
  // Whether keyboard focus is on the request button. Removing a focused
  // element fires no blur event, so the flag survives the button unmounting
  // and tells us the transition itself displaced the focus (WCAG 2.4.3).
  const requestButtonHadFocus = useRef(false);
  const previousStatus = useRef(status);
  const dismissButtonRef = useRef<HTMLButtonElement>(null);
  const retryButtonRef = useRef<HTMLButtonElement>(null);

  // Focus management when leaving 'requesting' (DESIGN.md §9.1): the button
  // unmounts and, without this, focus would fall to document.body.
  useEffect(() => {
    const previous = previousStatus.current;
    previousStatus.current = status;
    if (previous !== 'requesting' || status === 'requesting') {
      return;
    }
    // Only restore focus that the transition displaced; if the user was
    // somewhere else, never steal it.
    if (!requestButtonHadFocus.current) {
      return;
    }
    requestButtonHadFocus.current = false;
    if (status === 'denied') {
      dismissButtonRef.current?.focus();
    } else if (status === 'error') {
      retryButtonRef.current?.focus();
    } else if (status === 'granted') {
      onGrantedFocusHandoff?.();
    }
  }, [status, onGrantedFocusHandoff]);

  if (status === 'unsupported' || status === 'granted') {
    return null;
  }

  if (status === 'idle' || status === 'requesting') {
    const isRequesting = status === 'requesting';
    return (
      // The live region must exist before its content changes to
      // "Obteniendo…" for screen readers to announce the transition.
      <div role="status" className="min-h-10">
        {/*
          idle and requesting share this very <button>: swapping elements
          would expel keyboard focus (WCAG 2.4.3). While requesting it is
          marked aria-disabled + onClick guard — never `disabled`, which
          would also push focus to document.body (DESIGN.md §9.1).
        */}
        <button
          type="button"
          aria-disabled={isRequesting || undefined}
          onClick={() => {
            if (isRequesting) {
              return;
            }
            onRequestLocation();
          }}
          onFocus={() => {
            requestButtonHadFocus.current = true;
          }}
          onBlur={() => {
            requestButtonHadFocus.current = false;
          }}
          className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border border-line bg-surface-raised px-4 text-sm font-medium text-brand transition-colors not-aria-disabled:hover:bg-brand-soft aria-disabled:cursor-default aria-disabled:opacity-60"
        >
          {isRequesting ? <Spinner className="size-4" /> : <LocationIcon className="size-5" />}
          {isRequesting ? 'Obteniendo tu ubicación…' : 'Usar mi ubicación'}
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
          ref={dismissButtonRef}
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
        ref={retryButtonRef}
        type="button"
        onClick={onRequestLocation}
        className="ml-auto h-10 shrink-0 cursor-pointer rounded-lg px-3 text-sm font-medium text-brand transition-colors hover:bg-brand-soft"
      >
        Reintentar
      </button>
    </InfoRow>
  );
}
