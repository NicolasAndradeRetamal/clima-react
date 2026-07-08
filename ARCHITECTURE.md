# ARCHITECTURE — clima-react

Weather app. Portfolio project, **frontend-only**: React + TypeScript consuming the
public Open-Meteo APIs (no API key, no own backend). This document is the contract
for the frontend agent: folder layout, dependency versions, API contract, hook
design, UI state handling, testing and deployment.

Conventions (from CLAUDE.md, non-negotiable):

- Code, identifiers and comments in **English**; all UI texts in **Spanish**.
- Strict TypeScript; every API response is typed.
- Functional components with hooks; data logic lives in dedicated hooks, never inline in components.

---

## 1. Overview and technical decisions

Single-page app, single view (no routing):

- **Search bar** with autocomplete (Open-Meteo Geocoding API, debounced).
- **Current weather panel** for the selected city: temperature, feels-like,
  wind, humidity, condition icon.
- **7-day forecast** list.
- **Favorites** strip persisted in `localStorage`; clicking a favorite selects it.
- Visible states for loading, network error and "city not found".

Key decisions:

| Decision | Choice | Why |
|---|---|---|
| Routing | **None** (single view, selected city in React state) | MVP has one screen; a router adds no value. If a `/city/:id` deep link is ever wanted, add `react-router` later — nothing in this design blocks it. |
| Server state | TanStack Query v5 only | Mandated by stack; caching, retries and status flags come free. No Redux/Zustand — the only client state is the selected city and the favorites list. |
| Favorites persistence | Custom `useFavorites` hook over `localStorage` | Simple, testable, no extra dependency. |
| Styling | Tailwind CSS v4 via `@tailwindcss/vite` plugin | Mandated; v4 needs no `tailwind.config` for the default setup. |
| Icons | Domain-level `WeatherKind` enum + `<WeatherIcon kind isDay />` component | Decouples WMO codes from visuals. The **designer** (DESIGN.md) decides the actual glyphs (inline SVG set recommended; an icon library is acceptable). |
| HTTP mocking in tests | **MSW** (Mock Service Worker) | Tests exercise the real fetch path; fixtures mirror real Open-Meteo payloads. |
| HTTP client | Native `fetch` + tiny typed wrapper (`src/api/client.ts`) | No axios; two GET endpoints don't justify a dependency. |

Language note: the app requests geocoding results with `language=es` and formats
dates with `Intl` / `toLocaleDateString('es-ES', ...)`. No i18n library.

---

## 2. Folder structure

```
clima-react/
├── CLAUDE.md
├── ARCHITECTURE.md          # this file
├── DESIGN.md                # produced by the designer agent
├── QA_REPORT.md             # produced by the QA agent
├── README.md
├── index.html
├── package.json
├── tsconfig.json            # strict: true
├── vite.config.ts           # react + tailwind plugins, vitest config
├── public/
│   └── favicon.svg
└── src/
    ├── main.tsx             # ReactDOM root + QueryClientProvider
    ├── App.tsx              # layout: search, favorites, weather panels
    ├── index.css            # `@import "tailwindcss";` + design tokens
    ├── api/
    │   ├── client.ts        # fetchJson<T>() wrapper + error classes
    │   ├── geocoding.ts     # searchCities(query): Promise<GeocodingResult[]>
    │   └── forecast.ts      # fetchForecast(coords): Promise<ForecastResponse>
    ├── hooks/
    │   ├── useDebouncedValue.ts
    │   ├── useCitySearch.ts
    │   ├── useWeather.ts
    │   └── useFavorites.ts
    ├── components/
    │   ├── search/
    │   │   ├── CitySearch.tsx        # input + dropdown, owns query string state
    │   │   └── SearchResultsList.tsx
    │   ├── weather/
    │   │   ├── CurrentWeatherCard.tsx
    │   │   ├── ForecastList.tsx
    │   │   ├── ForecastDayCard.tsx
    │   │   └── WeatherIcon.tsx       # (kind, isDay) -> SVG
    │   ├── favorites/
    │   │   ├── FavoritesList.tsx
    │   │   └── FavoriteToggleButton.tsx
    │   └── ui/
    │       ├── Spinner.tsx
    │       ├── ErrorMessage.tsx      # network/API error with retry button
    │       └── EmptyState.tsx        # "no results" / "no favorites yet"
    ├── lib/
    │   ├── weatherCodes.ts  # WMO code -> WeatherCondition mapping (pure)
    │   └── format.ts        # formatTemperature, formatWind, formatDayName (es-ES)
    ├── types/
    │   ├── geocoding.ts     # raw Geocoding API types
    │   ├── forecast.ts      # raw Forecast API types
    │   └── weather.ts       # domain types: City, FavoriteCity, WeatherCondition
    └── test/
        ├── setup.ts         # jest-dom, MSW server lifecycle
        ├── utils.tsx        # renderWithQueryClient helper
        └── mocks/
            ├── handlers.ts  # MSW handlers for both Open-Meteo endpoints
            └── fixtures.ts  # typed sample payloads
```

Rules:

- `components/` never call `fetch` or TanStack Query directly; they consume hooks.
- `api/` has no React imports; pure async functions, fully typed.
- `lib/` is pure functions only (easy unit-test targets).

---

## 3. Dependency versions

Latest stable as of 2026-07-08 (verified on npm). Use caret ranges in
`package.json`; these are the versions the project is built and tested against.

**dependencies**

| Package | Version |
|---|---|
| `react` | 19.2.7 |
| `react-dom` | 19.2.7 |
| `@tanstack/react-query` | 5.101.2 |

**devDependencies**

| Package | Version |
|---|---|
| `typescript` | 6.0.3 |
| `vite` | 8.1.3 |
| `@vitejs/plugin-react` | 6.0.3 |
| `tailwindcss` | 4.3.2 |
| `@tailwindcss/vite` | 4.3.2 |
| `vitest` | 4.1.10 |
| `@testing-library/react` | 16.3.2 |
| `@testing-library/jest-dom` | 6.9.1 |
| `@testing-library/user-event` | 14.6.1 |
| `jsdom` | 29.1.1 |
| `msw` | 2.15.0 |
| `@types/react`, `@types/react-dom` | latest matching React 19 |

`tsconfig.json` must set `"strict": true` (plus `noUncheckedIndexedAccess` — the
forecast API returns parallel arrays, so indexed access must be checked).

---

## 4. Open-Meteo API contract

Both endpoints are plain GET, JSON, CORS-enabled, no auth. Base URLs as constants
in `src/api/client.ts`.

### 4.1 Geocoding (city autocomplete)

```
GET https://geocoding-api.open-meteo.com/v1/search
    ?name={query}          # user input, URL-encoded
    &count=8               # dropdown size
    &language=es           # localized city/country names
    &format=json
```

Response types (`src/types/geocoding.ts`):

```ts
export interface GeocodingSearchResponse {
  /** Absent (not empty array) when there are no matches. */
  results?: GeocodingResult[];
  generationtime_ms: number;
}

export interface GeocodingResult {
  id: number;            // stable Open-Meteo location id -> favorite id
  name: string;          // "Madrid"
  latitude: number;
  longitude: number;
  country: string;       // "España"
  country_code: string;  // "ES"
  admin1?: string;       // first-level region, e.g. "Comunidad de Madrid"
  timezone: string;      // "Europe/Madrid"
  population?: number;
  elevation?: number;
}
```

`searchCities()` normalizes `results ?? []` so callers always get an array.
An empty array with a non-empty query is the **"ciudad no encontrada"** state.

### 4.2 Forecast (current weather + 7 days)

```
GET https://api.open-meteo.com/v1/forecast
    ?latitude={lat}
    &longitude={lon}
    &current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day
    &daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max
    &timezone=auto          # daily.time aligned to the city's local timezone
    &forecast_days=7
    &wind_speed_unit=kmh
```

Response types (`src/types/forecast.ts`):

```ts
export interface ForecastResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  current: CurrentWeather;
  current_units: CurrentWeatherUnits;
  daily: DailyForecast;
  daily_units: DailyForecastUnits;
}

export interface CurrentWeather {
  time: string;                   // ISO 8601 local time, e.g. "2026-07-08T14:30"
  temperature_2m: number;         // °C
  apparent_temperature: number;   // °C (feels like)
  relative_humidity_2m: number;   // %
  wind_speed_10m: number;         // km/h
  weather_code: number;           // WMO code, see §4.4
  is_day: 0 | 1;
}

export interface CurrentWeatherUnits {
  temperature_2m: string;         // "°C"
  apparent_temperature: string;
  relative_humidity_2m: string;   // "%"
  wind_speed_10m: string;         // "km/h"
}

/** Parallel arrays, all of length 7 (index i = day i, index 0 = today). */
export interface DailyForecast {
  time: string[];                          // "YYYY-MM-DD"
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  precipitation_probability_max: number[]; // %
}

export interface DailyForecastUnits {
  temperature_2m_max: string;
  temperature_2m_min: string;
  precipitation_probability_max: string;
}
```

### 4.3 Errors

On invalid parameters Open-Meteo answers HTTP 400 with
`{ "error": true, "reason": "..." }`. The `fetchJson` wrapper in
`src/api/client.ts` defines:

```ts
/** Non-2xx HTTP response (includes Open-Meteo's `reason` when present). */
export class ApiError extends Error {
  constructor(public readonly status: number, message: string) { ... }
}
```

- `fetch` rejecting (offline, DNS, CORS) surfaces as a `TypeError` → treated as
  **network error** in the UI.
- Non-OK responses throw `ApiError` → treated as unexpected API error.
- Both are considered retryable failures by the query config (§5.4); "no results"
  is **not** an error — it is a successful response with an empty list.

### 4.4 WMO weather codes → condition mapping

Domain types (`src/types/weather.ts`):

```ts
export type WeatherKind =
  | 'clear'
  | 'partly-cloudy'
  | 'overcast'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'freezing-rain'
  | 'snow'
  | 'showers'
  | 'thunderstorm';

export interface WeatherCondition {
  kind: WeatherKind;   // drives which icon is rendered
  label: string;       // Spanish description shown in the UI
}
```

Mapping implemented as a pure function in `src/lib/weatherCodes.ts`
(`getWeatherCondition(code: number): WeatherCondition`); unknown codes fall back
to `{ kind: 'overcast', label: 'Condición desconocida' }`.

| WMO codes | `kind` | `label` (Spanish, UI text) |
|---|---|---|
| 0 | `clear` | Despejado |
| 1 | `clear` | Mayormente despejado |
| 2 | `partly-cloudy` | Parcialmente nublado |
| 3 | `overcast` | Nublado |
| 45, 48 | `fog` | Niebla |
| 51, 53, 55 | `drizzle` | Llovizna |
| 56, 57 | `freezing-rain` | Llovizna helada |
| 61, 63, 65 | `rain` | Lluvia |
| 66, 67 | `freezing-rain` | Lluvia helada |
| 71, 73, 75, 77 | `snow` | Nieve |
| 80, 81, 82 | `showers` | Chubascos |
| 85, 86 | `snow` | Chubascos de nieve |
| 95 | `thunderstorm` | Tormenta |
| 96, 99 | `thunderstorm` | Tormenta con granizo |

`WeatherIcon` receives `kind` and `isDay: boolean` (day/night variants matter at
least for `clear` and `partly-cloudy`; other kinds may share one glyph).

### 4.5 Domain types

```ts
/** A selectable location, derived from GeocodingResult. */
export interface City {
  id: number;
  name: string;
  admin1?: string;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
}

/** What is persisted in localStorage. Same shape, explicit alias for clarity. */
export type FavoriteCity = City;
```

`City` is built from `GeocodingResult` in `api/geocoding.ts` (single mapping
point). The selected `City` lives in `App` state (`useState<City | null>`).

---

## 5. Hooks design (TanStack Query)

### 5.1 Query keys

Centralized in a `queryKeys` object (can live in `src/api/client.ts`):

```ts
export const queryKeys = {
  citySearch: (query: string) => ['citySearch', query.trim().toLowerCase()] as const,
  forecast: (lat: number, lon: number) =>
    ['forecast', Number(lat.toFixed(4)), Number(lon.toFixed(4))] as const,
};
```

Coordinates rounded to 4 decimals so cache hits are stable.

### 5.2 `useDebouncedValue<T>(value: T, delayMs = 300): T`

Generic utility hook (timer in `useEffect`). Kept separate so it can be unit
tested with fake timers and reused.

### 5.3 `useCitySearch(query: string)`

```ts
function useCitySearch(query: string): UseQueryResult<City[], Error> & { isDebouncing: boolean }
```

- Debounces `query` internally with `useDebouncedValue(query, 300)`.
- `enabled: debouncedQuery.trim().length >= 2` (no requests for 0–1 chars).
- `queryKey: queryKeys.citySearch(debouncedQuery)`.
- `queryFn: () => searchCities(debouncedQuery)` → returns `City[]`.
- `staleTime: Infinity` — geocoding results for a given string don't change.
- `placeholderData: keepPreviousData` — previous results stay visible while the
  next keystroke's query loads (no dropdown flicker).
- Exposes `isDebouncing` (`query !== debouncedQuery`) so the UI can show the
  spinner as soon as the user types.

### 5.4 `useWeather(city: City | null)`

```ts
function useWeather(city: City | null): UseQueryResult<ForecastResponse, Error>
```

- `enabled: city !== null`.
- `queryKey: queryKeys.forecast(city.latitude, city.longitude)`.
- `queryFn: () => fetchForecast({ latitude, longitude })`.
- `staleTime: 10 * 60 * 1000` (10 min — weather doesn't move faster).
- `refetchOnWindowFocus: true` (default) — stale weather refreshes when the user
  returns to the tab.
- Components derive display data from `data.current` / `data.daily` +
  `getWeatherCondition`; no transformation layer needed for this size.

Global `QueryClient` defaults (in `main.tsx`):

```ts
new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,                    // one retry, then show the error UI
      retryDelay: 1000,
    },
  },
});
```

### 5.5 `useFavorites()`

No TanStack Query — pure client state backed by `localStorage`.

```ts
const STORAGE_KEY = 'clima-react:favorites';

function useFavorites(): {
  favorites: FavoriteCity[];
  isFavorite: (cityId: number) => boolean;
  addFavorite: (city: City) => void;
  removeFavorite: (cityId: number) => void;
  toggleFavorite: (city: City) => void;
}
```

- Lazy `useState` initializer reads and `JSON.parse`s the key; any parse error
  or invalid shape → `[]` (never crash on corrupted storage).
- Every mutation writes back synchronously with `JSON.stringify`.
- Stored value: `FavoriteCity[]`, deduplicated by `id`, capped at **10** entries
  (oldest dropped) to keep the UI strip sane.
- Cross-tab sync via the `storage` event is a nice-to-have, **not** MVP.

---

## 6. UI state handling

Every remote interaction has an explicit visual state. Spanish copy is final
wording unless DESIGN.md overrides it.

| Situation | Detection | UI |
|---|---|---|
| Typing, search in flight | `isDebouncing \|\| isFetching` on `useCitySearch` | Small `Spinner` inside the search input |
| Search: no matches | `data.length === 0 && debouncedQuery.length >= 2` | `EmptyState`: "No se encontraron ciudades para «{query}»" |
| Search: request failed | `isError` | Inline message in dropdown: "No se pudo buscar. Revisa tu conexión." |
| Weather loading (first time) | `isPending` on `useWeather` | Skeleton/spinner over the weather panel |
| Weather refetching | `isFetching && !isPending` | Keep data visible; subtle indicator only |
| Weather: network/API error | `isError` | `ErrorMessage`: "No se pudo cargar el clima. Comprueba tu conexión e inténtalo de nuevo." + "Reintentar" button calling `refetch()` |
| No city selected yet | `city === null` | `EmptyState`: "Busca una ciudad para ver el clima" |
| No favorites | `favorites.length === 0` | `EmptyState`: "Aún no tienes ciudades favoritas" |

Accessibility minimums: dropdown results navigable by keyboard (at least
Enter to pick the first result), status regions with `role="status"` /
`role="alert"`, icons with `aria-hidden` plus visible text labels.

---

## 7. Testing strategy (Vitest + RTL + MSW)

Config: Vitest runs through `vite.config.ts` (`test` block), `environment:
'jsdom'`, `setupFiles: ['src/test/setup.ts']`, `globals: true`.
`setup.ts` imports `@testing-library/jest-dom/vitest` and starts/resets/stops
the MSW node server (`beforeAll`/`afterEach`/`afterAll`).

Mocking: **MSW** intercepts `https://geocoding-api.open-meteo.com/*` and
`https://api.open-meteo.com/*`. Fixtures in `src/test/mocks/fixtures.ts` are
typed with the interfaces from §4 so drift between types and fixtures fails
compilation. Per-test overrides via `server.use(...)` simulate errors
(`HttpResponse.error()` for network failure, 400 JSON for API errors) and empty
results. `localStorage` is faked per test (jsdom provides it; clear it in
`afterEach`).

Test helper `renderWithQueryClient` wraps components in a fresh `QueryClient`
per test with `retry: false` to keep error tests fast.

What gets tested (priority order):

1. **`lib/weatherCodes.ts`** (unit): representative code from each group maps to
   the right `kind` + Spanish label; unknown code falls back safely.
2. **`lib/format.ts`** (unit): temperature rounding, wind formatting, es-ES day
   names.
3. **`useFavorites`** (hook, `renderHook`): add/remove/toggle, persistence to
   `localStorage`, dedupe, cap at 10, corrupted JSON → empty list.
4. **`useDebouncedValue`** (hook, fake timers).
5. **`CitySearch` flow** (component + MSW): typing ≥2 chars shows results;
   empty response shows "No se encontraron ciudades…"; network error shows the
   error message; selecting a result fires the callback.
6. **Weather panel** (component + MSW): renders current temperature,
   feels-like, humidity, wind and 7 forecast cards from the fixture; error
   fixture renders `ErrorMessage` and "Reintentar" triggers a refetch.

Not tested: visual styling, Open-Meteo itself, exhaustive WMO codes beyond one
per group.

---

## 8. Static deployment (no Docker)

- `npm run build` → `tsc -b && vite build` → static assets in `dist/`.
  Purely static SPA; no server, no rewrites needed (no client-side routing).
- Calls go directly from the browser to Open-Meteo (CORS is open); no proxy and
  no environment variables/secrets are required. Base URLs are plain constants.
- Target platform is the devops agent's call; both are trivial:
  - **GitHub Pages**: set `base: '/clima-react/'` in `vite.config.ts` (or
    `base: './'`) and deploy `dist/` via GitHub Actions.
  - **Vercel/Netlify**: zero config (build command `npm run build`, output `dist`).
- CI (GitHub Actions): `npm ci` → `tsc -b --noEmit`-equivalent type check →
  `vitest run` → `vite build` on every push/PR.
