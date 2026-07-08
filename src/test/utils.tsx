import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderResult } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // keep error tests fast
      },
    },
  });
}

/** Renders `ui` inside a fresh QueryClientProvider (one client per test). */
export function renderWithQueryClient(
  ui: ReactElement,
): RenderResult & { queryClient: QueryClient } {
  const queryClient = createTestQueryClient();

  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  return Object.assign(render(ui, { wrapper: Wrapper }), { queryClient });
}
