import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Clima — Pronóstico del tiempo',
        short_name: 'Clima',
        description: 'Clima actual y pronóstico de 7 días con Open-Meteo',
        lang: 'es',
        display: 'standalone',
        // Manifest colors are static (no light-dark()): brand blue for the
        // installed title bar, dark surface for the splash (DESIGN.md §10.2).
        theme_color: '#0284c7',
        background_color: '#0f172a',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // App shell precache, including the lazy recharts chunk.
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        runtimeCaching: [
          {
            // Forecast: fresh if possible, last successful response when offline.
            urlPattern: ({ url }) => url.origin === 'https://api.open-meteo.com',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'forecast-api',
              networkTimeoutSeconds: 4,
              expiration: { maxEntries: 12, maxAgeSeconds: 6 * 60 * 60 }, // 6 h
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Geocoding: results for a query are immutable (mirrors staleTime: Infinity).
            urlPattern: ({ url }) => url.origin === 'https://geocoding-api.open-meteo.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'geocoding-api',
              expiration: { maxEntries: 50, maxAgeSeconds: 7 * 24 * 60 * 60 }, // 7 d
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      // SW only in build/preview: dev server and Vitest never see it (no MSW clash).
      devOptions: { enabled: false },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['src/test/setup.ts'],
  },
});
