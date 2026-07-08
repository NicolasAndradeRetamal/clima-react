/** Tiny typed HTTP layer shared by both Open-Meteo endpoints. No React here. */

export const GEOCODING_BASE_URL = 'https://geocoding-api.open-meteo.com/v1';
export const FORECAST_BASE_URL = 'https://api.open-meteo.com/v1';

/** Non-2xx HTTP response (includes Open-Meteo's `reason` when present). */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Error body Open-Meteo returns on invalid parameters (HTTP 400). */
interface OpenMeteoErrorBody {
  error: boolean;
  reason: string;
}

function isOpenMeteoErrorBody(value: unknown): value is OpenMeteoErrorBody {
  return (
    typeof value === 'object' &&
    value !== null &&
    'reason' in value &&
    typeof (value as Record<string, unknown>).reason === 'string'
  );
}

/**
 * Fetches a URL and parses the JSON body as `T`.
 * - Network failures (offline, DNS, CORS) reject with the native `TypeError`.
 * - Non-OK responses reject with `ApiError`.
 */
export async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const body: unknown = await response.json();
      if (isOpenMeteoErrorBody(body)) {
        message = body.reason;
      }
    } catch {
      // Non-JSON error body: keep the default message.
    }
    throw new ApiError(response.status, message);
  }
  return response.json() as Promise<T>;
}

/** Centralized TanStack Query keys. Coordinates rounded so cache hits are stable. */
export const queryKeys = {
  citySearch: (query: string) => ['citySearch', query.trim().toLowerCase()] as const,
  forecast: (lat: number, lon: number) =>
    ['forecast', Number(lat.toFixed(4)), Number(lon.toFixed(4))] as const,
};
