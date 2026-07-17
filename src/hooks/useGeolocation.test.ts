import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { installGeolocationMock } from '../test/mocks/geolocation';
import { useGeolocation } from './useGeolocation';

const lima = { latitude: -12.0432, longitude: -77.0282 };

describe('useGeolocation', () => {
  it('is "unsupported" when navigator.geolocation does not exist (jsdom default)', () => {
    const { result } = renderHook(() => useGeolocation());

    expect(result.current.status).toBe('unsupported');
    expect(result.current.coords).toBeNull();
  });

  it('stays "unsupported" if requestLocation is called anyway', () => {
    const { result } = renderHook(() => useGeolocation());

    act(() => {
      result.current.requestLocation();
    });

    expect(result.current.status).toBe('unsupported');
  });

  it('auto-requests silently when the permission is already granted', async () => {
    const { getCurrentPosition } = installGeolocationMock({
      permission: 'granted',
      position: lima,
    });
    const { result } = renderHook(() => useGeolocation());

    await waitFor(() => {
      expect(result.current.status).toBe('granted');
    });
    expect(result.current.coords).toEqual(lima);
    expect(getCurrentPosition).toHaveBeenCalledTimes(1);
  });

  it('does not re-request when "granted" resolves after a manual request', async () => {
    const { getCurrentPosition } = installGeolocationMock({
      permission: 'granted',
      position: lima,
    });
    const { result } = renderHook(() => useGeolocation());

    // Manual request before the Permissions API query resolves: the silent
    // auto-read must notice it and skip its own fetch (no flicker back to
    // 'requesting', no duplicate getCurrentPosition call).
    act(() => {
      result.current.requestLocation();
    });

    await waitFor(() => {
      expect(result.current.status).toBe('granted');
    });
    expect(getCurrentPosition).toHaveBeenCalledTimes(1);
  });

  it('is "denied" from mount when the Permissions API reports denied', async () => {
    const { getCurrentPosition } = installGeolocationMock({ permission: 'denied' });
    const { result } = renderHook(() => useGeolocation());

    await waitFor(() => {
      expect(result.current.status).toBe('denied');
    });
    expect(getCurrentPosition).not.toHaveBeenCalled();
  });

  it('is "idle" on prompt and reaches "granted" after requestLocation()', async () => {
    installGeolocationMock({ permission: 'prompt', position: lima });
    const { result } = renderHook(() => useGeolocation());

    expect(result.current.status).toBe('idle');

    act(() => {
      result.current.requestLocation();
    });

    await waitFor(() => {
      expect(result.current.status).toBe('granted');
    });
    expect(result.current.coords).toEqual(lima);
  });

  it('shows "requesting" while in flight and ignores duplicate requests', () => {
    // Neither position nor errorCode: getCurrentPosition never answers.
    const { getCurrentPosition } = installGeolocationMock({ permission: 'prompt' });
    const { result } = renderHook(() => useGeolocation());

    act(() => {
      result.current.requestLocation();
      result.current.requestLocation();
    });

    expect(result.current.status).toBe('requesting');
    expect(getCurrentPosition).toHaveBeenCalledTimes(1);
  });

  it('maps error code 1 (permission denied at the prompt) to "denied"', async () => {
    installGeolocationMock({ permission: 'prompt', errorCode: 1 });
    const { result } = renderHook(() => useGeolocation());

    act(() => {
      result.current.requestLocation();
    });

    await waitFor(() => {
      expect(result.current.status).toBe('denied');
    });
  });

  it('maps error code 3 (timeout) to "error" and allows a successful retry', async () => {
    const { config } = installGeolocationMock({ permission: 'prompt', errorCode: 3 });
    const { result } = renderHook(() => useGeolocation());

    act(() => {
      result.current.requestLocation();
    });
    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });

    // The transient failure clears; the retry succeeds.
    config.errorCode = undefined;
    config.position = lima;
    act(() => {
      result.current.requestLocation();
    });

    await waitFor(() => {
      expect(result.current.status).toBe('granted');
    });
    expect(result.current.coords).toEqual(lima);
  });

  it('falls back to "idle" when the Permissions API is unavailable', () => {
    installGeolocationMock({ permission: 'unavailable' });
    const { result } = renderHook(() => useGeolocation());

    expect(result.current.status).toBe('idle');
  });
});
