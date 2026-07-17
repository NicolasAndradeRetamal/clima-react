import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { registerSW } from 'virtual:pwa-register';
import { App } from './App';
import './index.css';

// No-op where serviceWorker is unavailable (jsdom, dev server).
registerSW({ immediate: true });

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // one retry, then show the error UI
      retryDelay: 1000,
      // The default 'online' mode would pause queries while offline and the
      // service worker would never get to answer from its cache.
      networkMode: 'offlineFirst',
    },
  },
});

const container = document.getElementById('root');
if (container === null) {
  throw new Error('Root element "#root" not found');
}

createRoot(container).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);
