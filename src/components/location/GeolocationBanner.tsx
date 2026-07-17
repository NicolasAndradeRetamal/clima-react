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
  /** Called on grant if focus was on the banner button, which unmounts. */
  onGrantedFocusHandoff?: () => void;
}

/** Offers the current position without ever blocking manual search. */
export function GeolocationBanner({
  status,
  onRequestLocation,
  onGrantedFocusHandoff,
}: GeolocationBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  // Removing a focused element fires no blur, so this survives the unmount.
  const requestButtonHadFocus = useRef(false);
  const previousStatus = useRef(status);
  const dismissButtonRef = useRef<HTMLButtonElement>(null);
  const retryButtonRef = useRef<HTMLButtonElement>(null);

  // When the requesting button unmounts, focus would fall to document.body.
  useEffect(() => {
    const previous = previousStatus.current;
    previousStatus.current = status;
    if (previous !== 'requesting' || status === 'requesting') {
      return;
    }
    // Never steal focus the user had somewhere else.
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
      // The live region must exist before its content changes to be announced.
      <div role="status" className="min-h-10">
        {/* Same button for both states; aria-disabled instead of `disabled`
            so keyboard focus is never expelled */}
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
