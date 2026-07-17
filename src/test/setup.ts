import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from './mocks/handlers';

/**
 * jsdom does not implement ResizeObserver, which recharts'
 * ResponsiveContainer needs. The mock reports a fixed size synchronously so
 * charts actually render content in component tests.
 */
class ResizeObserverMock implements ResizeObserver {
  constructor(private readonly callback: ResizeObserverCallback) {}

  observe(target: Element): void {
    const contentRect = { width: 600, height: 256, top: 0, left: 0, x: 0, y: 0 };
    this.callback([{ target, contentRect } as ResizeObserverEntry], this);
  }

  unobserve(): void {}

  disconnect(): void {}
}

globalThis.ResizeObserver = ResizeObserverMock;

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  server.resetHandlers();
  localStorage.clear();
});

afterAll(() => {
  server.close();
});
