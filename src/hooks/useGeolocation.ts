import { useCallback, useEffect, useRef, useState } from 'react';
import type { Coordinates } from '../api/forecast';

export type GeolocationStatus =
  | 'unsupported' // navigator.geolocation is undefined
  | 'idle' // supported, permission not requested yet (Permissions API: 'prompt')
  | 'requesting' // getCurrentPosition in flight
  | 'granted' // coords available
  | 'denied' // user denied (error code 1 or Permissions API 'denied')
  | 'error'; // POSITION_UNAVAILABLE or TIMEOUT

interface GeolocationState {
  status: GeolocationStatus;
  /** Non-null only when status === 'granted'. */
  coords: Coordinates | null;
}

/** GeolocationPositionError.PERMISSION_DENIED (mocks may omit the constant). */
const PERMISSION_DENIED_CODE = 1;

const POSITION_OPTIONS: PositionOptions = {
  enableHighAccuracy: false, // city-level precision is enough
  timeout: 10_000,
  maximumAge: 5 * 60_000, // accept a cached position up to 5 min old
};

export interface UseGeolocationResult extends GeolocationState {
  /** Triggers the browser prompt/read. Idempotent while 'requesting'. */
  requestLocation: () => void;
}

/**
 * Browser geolocation as a state machine. The browser prompt is never shown
 * until the user explicitly calls `requestLocation`.
 */
export function useGeolocation(): UseGeolocationResult {
  const [state, setState] = useState<GeolocationState>(() => {
    // jsdom and some browsers lack the API entirely.
    const geolocation: Geolocation | undefined = navigator.geolocation;
    return { status: geolocation === undefined ? 'unsupported' : 'idle', coords: null };
  });
  const stateRef = useRef(state);
  stateRef.current = state;

  const requestLocation = useCallback(() => {
    const { status } = stateRef.current;
    if (status === 'requesting' || status === 'unsupported') {
      return;
    }
    // Sync the ref immediately so a re-entrant call (StrictMode double
    // effects) cannot fire getCurrentPosition twice.
    stateRef.current = { status: 'requesting', coords: null };
    setState(stateRef.current);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          status: 'granted',
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
        });
      },
      (positionError) => {
        setState({
          status: positionError.code === PERMISSION_DENIED_CODE ? 'denied' : 'error',
          coords: null,
        });
      },
      POSITION_OPTIONS,
    );
  }, []);

  useEffect(() => {
    if (stateRef.current.status === 'unsupported') {
      return;
    }
    const permissions: Permissions | undefined = navigator.permissions;
    if (permissions === undefined) {
      return; // Permissions API missing → stay 'idle'; the banner button works.
    }
    let cancelled = false;
    permissions
      .query({ name: 'geolocation' })
      .then((result) => {
        if (cancelled) {
          return;
        }
        if (result.state === 'denied') {
          setState({ status: 'denied', coords: null });
        } else if (result.state === 'granted' && stateRef.current.status === 'idle') {
          // Already granted → no prompt. Only from 'idle', so a manual
          // request is never flicked back to 'requesting'.
          requestLocation();
        }
        // 'prompt' → stay 'idle' until the user clicks the banner button.
      })
      .catch(() => {
        // Permissions query failed → keep 'idle'.
      });
    return () => {
      cancelled = true;
    };
  }, [requestLocation]);

  return { ...state, requestLocation };
}
