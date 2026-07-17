import { afterEach, vi, type Mock } from 'vitest';

/**
 * jsdom implements neither the Geolocation API nor the Permissions API (both
 * `navigator` fields are undefined), which is exactly the 'unsupported' case.
 * This helper installs configurable mocks for the other cases and restores
 * the pristine navigator after each test.
 */

export interface GeolocationMockConfig {
  /** Permissions API state; 'unavailable' leaves `navigator.permissions` undefined. */
  permission?: PermissionState | 'unavailable';
  /** Coordinates delivered by getCurrentPosition on success. */
  position?: { latitude: number; longitude: number };
  /** When set, getCurrentPosition fails with this GeolocationPositionError code. */
  errorCode?: 1 | 2 | 3;
}

let installed = false;

export function restoreGeolocationMocks(): void {
  if (!installed) {
    return;
  }
  Reflect.deleteProperty(navigator, 'geolocation');
  Reflect.deleteProperty(navigator, 'permissions');
  installed = false;
}

afterEach(restoreGeolocationMocks);

/**
 * Installs `navigator.geolocation` (+ optionally `navigator.permissions`).
 * Returns the spy and the live config: tests may mutate `config` between
 * calls (e.g. fail first, succeed on retry). With neither `position` nor
 * `errorCode`, getCurrentPosition never answers (stays 'requesting').
 */
export function installGeolocationMock(config: GeolocationMockConfig = {}): {
  getCurrentPosition: Mock;
  config: GeolocationMockConfig;
} {
  const getCurrentPosition = vi.fn(
    (success: PositionCallback, error?: PositionErrorCallback) => {
      queueMicrotask(() => {
        if (config.errorCode !== undefined) {
          error?.({
            code: config.errorCode,
            message: 'mock geolocation error',
            PERMISSION_DENIED: 1,
            POSITION_UNAVAILABLE: 2,
            TIMEOUT: 3,
          } as GeolocationPositionError);
        } else if (config.position !== undefined) {
          // Only the two coordinate fields are read by the app.
          success({
            coords: config.position,
            timestamp: Date.now(),
          } as GeolocationPosition);
        }
      });
    },
  );

  Object.defineProperty(navigator, 'geolocation', {
    value: { getCurrentPosition },
    configurable: true,
  });

  const permission = config.permission ?? 'prompt';
  Object.defineProperty(navigator, 'permissions', {
    value:
      permission === 'unavailable'
        ? undefined
        : { query: vi.fn().mockResolvedValue({ state: permission }) },
    configurable: true,
  });

  installed = true;
  return { getCurrentPosition, config };
}
