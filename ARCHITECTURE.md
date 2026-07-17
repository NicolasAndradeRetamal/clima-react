# ARCHITECTURE — clima-react

Aplicación de clima. Proyecto de portafolio, **frontend-only**: React + TypeScript
consumiendo las APIs públicas de Open-Meteo (sin API key, sin backend propio).
Este documento es el contrato para el agente frontend: estructura de carpetas,
versiones de dependencias, contrato de la API, diseño de hooks, manejo de estados
de UI, testing y despliegue.

El documento tiene dos partes: la **Parte I** (§1–§8) define el MVP, ya
construido y desplegado; la **Parte II** (§9–§13) define el alcance v2
(gráfico horario, geolocalización, PWA). Los puntos de la Parte I que v2
modifica están marcados con comentarios `v2 (§n)`.

Convenciones (de CLAUDE.md, no negociables):

- Código, identificadores y comentarios en **inglés**; todos los textos de UI en **español**.
- TypeScript estricto; toda respuesta de la API está tipada.
- Componentes funcionales con hooks; la lógica de datos vive en hooks dedicados, nunca inline en los componentes.

---

## 1. Visión general y decisiones técnicas

Single-page app, una sola vista (sin routing):

- **Barra de búsqueda** con autocompletado (Geocoding API de Open-Meteo, con debounce).
- **Panel de clima actual** para la ciudad seleccionada: temperatura, sensación
  térmica, viento, humedad, icono según condición.
- Lista de **pronóstico de 7 días**.
- Franja de **favoritas** persistida en `localStorage`; hacer clic en una favorita la selecciona.
- Estados visibles para cargando, error de red y "ciudad no encontrada".

Decisiones clave:

| Decisión | Elección | Por qué |
|---|---|---|
| Routing | **Ninguno** (vista única, ciudad seleccionada en estado de React) | El MVP tiene una sola pantalla; un router no aporta valor. Si algún día se quiere un deep link `/city/:id`, se añade `react-router` después — nada en este diseño lo bloquea. |
| Estado de servidor | Solo TanStack Query v5 | Impuesto por el stack; caché, reintentos y flags de estado vienen gratis. Sin Redux/Zustand — el único estado de cliente es la ciudad seleccionada y la lista de favoritas. |
| Persistencia de favoritas | Hook propio `useFavorites` sobre `localStorage` | Simple, testeable, sin dependencia extra. |
| Estilos | Tailwind CSS v4 vía el plugin `@tailwindcss/vite` | Impuesto; v4 no necesita `tailwind.config` para la configuración por defecto. |
| Iconos | Enum de dominio `WeatherKind` + componente `<WeatherIcon kind isDay />` | Desacopla los códigos WMO de lo visual. El **diseñador** (DESIGN.md) decide los glifos concretos (se recomienda un set de SVG inline; una librería de iconos es aceptable). |
| Mock de HTTP en tests | **MSW** (Mock Service Worker) | Los tests ejercitan el camino real de `fetch`; los fixtures replican payloads reales de Open-Meteo. |
| Cliente HTTP | `fetch` nativo + wrapper tipado mínimo (`src/api/client.ts`) | Sin axios; dos endpoints GET no justifican una dependencia. |

Nota de idioma: la app solicita los resultados de geocoding con `language=es` y
formatea fechas con `Intl` / `toLocaleDateString('es-ES', ...)`. Sin librería de i18n.

---

## 2. Estructura de carpetas

Las entradas marcadas `# v2` son nuevas en el alcance v2 (§9–§13).

```
clima-react/
├── CLAUDE.md
├── ARCHITECTURE.md          # this file
├── DESIGN.md                # produced by the designer agent
├── QA_REPORT.md             # produced by the QA agent
├── README.md
├── index.html               # v2: theme-color meta + apple-touch-icon link (§12.2)
├── package.json
├── tsconfig.json            # strict: true
├── vite.config.ts           # react + tailwind plugins, vitest config; v2: VitePWA (§12)
├── public/
│   ├── favicon.svg
│   ├── pwa-192x192.png           # v2 (§12.2), asset del diseñador
│   ├── pwa-512x512.png           # v2 (§12.2), asset del diseñador
│   ├── pwa-maskable-512x512.png  # v2 (§12.2), asset del diseñador
│   └── apple-touch-icon.png      # v2 (§12.2), asset del diseñador
└── src/
    ├── main.tsx             # ReactDOM root + QueryClientProvider; v2: registerSW (§12.3)
    ├── App.tsx              # layout: search, favorites, weather panels
    ├── index.css            # `@import "tailwindcss";` + design tokens
    ├── vite-env.d.ts        # v2: + vite-plugin-pwa/client types (§12.3)
    ├── api/
    │   ├── client.ts        # fetchJson<T>() wrapper + error classes
    │   ├── geocoding.ts     # searchCities(query): Promise<City[]>
    │   └── forecast.ts      # fetchForecast(coords): Promise<ForecastResponse>
    ├── hooks/
    │   ├── useDebouncedValue.ts
    │   ├── useCitySearch.ts
    │   ├── useWeather.ts
    │   ├── useFavorites.ts
    │   ├── useGeolocation.ts     # v2 (§11.2)
    │   └── useOnlineStatus.ts    # v2 (§12.5)
    ├── components/
    │   ├── search/
    │   │   ├── CitySearch.tsx        # input + dropdown, owns query string state
    │   │   └── SearchResultsList.tsx
    │   ├── location/
    │   │   └── GeolocationBanner.tsx # v2 (§11.5)
    │   ├── weather/
    │   │   ├── WeatherPanel.tsx      # owns useWeather + selected-day state (v2, §10.3)
    │   │   ├── WeatherSkeleton.tsx
    │   │   ├── CurrentWeatherCard.tsx
    │   │   ├── ForecastList.tsx      # v2: day cards become selectable (§10.3)
    │   │   ├── ForecastDayCard.tsx
    │   │   ├── HourlyChart.tsx       # v2 (§10.4), lazy-loaded
    │   │   ├── HourlyChartTooltip.tsx # v2 (§10.4)
    │   │   └── WeatherIcon.tsx       # (kind, isDay) -> SVG
    │   ├── favorites/
    │   │   ├── FavoritesList.tsx
    │   │   └── FavoriteToggleButton.tsx
    │   └── ui/
    │       ├── Spinner.tsx
    │       ├── SearchIcon.tsx
    │       ├── ErrorMessage.tsx      # network/API error with retry button
    │       ├── EmptyState.tsx        # "no results" / "no favorites yet"
    │       └── OfflineBanner.tsx     # v2 (§12.5)
    ├── lib/
    │   ├── weatherCodes.ts  # WMO code -> WeatherCondition mapping (pure)
    │   ├── format.ts        # formatTemperature, formatWind, formatDayName (es-ES)
    │   ├── hourly.ts        # v2 (§10.2): selectHourlyForDay (pure)
    │   └── location.ts      # v2 (§11.3): City/coords -> SelectedLocation mappers (pure)
    ├── types/
    │   ├── geocoding.ts     # raw Geocoding API types
    │   ├── forecast.ts      # raw Forecast API types (v2: + hourly, §4.2)
    │   └── weather.ts       # domain types: City, FavoriteCity, WeatherCondition
    │                        #   (v2: + SelectedLocation, §11.3)
    └── test/
        ├── setup.ts         # jest-dom, MSW server lifecycle
        ├── utils.tsx        # renderWithQueryClient helper
        └── mocks/
            ├── handlers.ts  # MSW handlers for both Open-Meteo endpoints
            ├── fixtures.ts  # typed sample payloads (v2: + hourly arrays)
            └── geolocation.ts # v2 (§11.6): navigator.geolocation mock helper
```

Reglas:

- Los componentes de `components/` nunca llaman a `fetch` ni a TanStack Query directamente; consumen hooks.
- `api/` no tiene imports de React; funciones async puras, totalmente tipadas.
- `lib/` contiene solo funciones puras (objetivos fáciles de test unitario).

---

## 3. Versiones de dependencias

Últimas estables a fecha 2026-07-08 (verificadas en npm). Usar rangos caret en
`package.json`; estas son las versiones contra las que el proyecto se construye y testea.

**dependencies**

| Paquete | Versión |
|---|---|
| `react` | 19.2.7 |
| `react-dom` | 19.2.7 |
| `@tanstack/react-query` | 5.101.2 |

**devDependencies**

| Paquete | Versión |
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
| `@types/react`, `@types/react-dom` | últimas compatibles con React 19 |

Las dependencias nuevas de v2 (`recharts`, `react-is`, `vite-plugin-pwa`) están
en §9 con sus versiones exactas.

`tsconfig.json` debe fijar `"strict": true` (más `noUncheckedIndexedAccess` — la
API de forecast devuelve arrays paralelos, así que el acceso por índice debe estar comprobado).

---

## 4. Contrato de la API de Open-Meteo

Ambos endpoints son GET planos, JSON, con CORS habilitado y sin autenticación.
Las URLs base van como constantes en `src/api/client.ts`.

### 4.1 Geocoding (autocompletado de ciudad)

```
GET https://geocoding-api.open-meteo.com/v1/search
    ?name={query}          # user input, URL-encoded
    &count=8               # dropdown size
    &language=es           # localized city/country names
    &format=json
```

Tipos de la respuesta (`src/types/geocoding.ts`):

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

`searchCities()` normaliza `results ?? []` para que quien la llame siempre reciba
un array. Un array vacío con una query no vacía es el estado **"ciudad no encontrada"**.

### 4.2 Forecast (clima actual + 7 días + horario)

```
GET https://api.open-meteo.com/v1/forecast
    ?latitude={lat}
    &longitude={lon}
    &current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day
    &daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max
    &hourly=temperature_2m,precipitation,precipitation_probability   # v2 (§10)
    &timezone=auto          # daily/hourly time aligned to the city's local timezone
    &forecast_days=7
    &wind_speed_unit=kmh
```

Tipos de la respuesta (`src/types/forecast.ts`):

```ts
export interface ForecastResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  current: CurrentWeather;
  current_units: CurrentWeatherUnits;
  daily: DailyForecast;
  daily_units: DailyForecastUnits;
  hourly: HourlyForecast;        // v2 (§10)
  hourly_units: HourlyForecastUnits; // v2 (§10)
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

/**
 * Parallel arrays, all of length 7 (index i = day i, index 0 = today).
 * Open-Meteo may emit `null` in cells without data (QA LOW-2); `time` is
 * always a valid ISO date string.
 */
export interface DailyForecast {
  time: string[];                          // "YYYY-MM-DD"
  weather_code: (number | null)[];
  temperature_2m_max: (number | null)[];
  temperature_2m_min: (number | null)[];
  precipitation_probability_max: (number | null)[]; // %
}

export interface DailyForecastUnits {
  temperature_2m_max: string;
  temperature_2m_min: string;
  precipitation_probability_max: string;
}

/**
 * v2 (§10). Parallel arrays, 24 entries per forecast day (168 total),
 * local-time aligned. Same nullability caveat as DailyForecast.
 */
export interface HourlyForecast {
  time: string[];                            // "YYYY-MM-DDTHH:mm"
  temperature_2m: (number | null)[];         // °C
  precipitation: (number | null)[];          // mm
  precipitation_probability: (number | null)[]; // %
}

export interface HourlyForecastUnits {
  temperature_2m: string;              // "°C"
  precipitation: string;               // "mm"
  precipitation_probability: string;   // "%"
}
```

### 4.3 Errores

Ante parámetros inválidos, Open-Meteo responde HTTP 400 con
`{ "error": true, "reason": "..." }`. El wrapper `fetchJson` de
`src/api/client.ts` define:

```ts
/** Non-2xx HTTP response (includes Open-Meteo's `reason` when present). */
export class ApiError extends Error {
  constructor(public readonly status: number, message: string) { ... }
}
```

- Un rechazo de `fetch` (offline, DNS, CORS) aflora como `TypeError` → se trata
  como **error de red** en la UI.
- Las respuestas no OK lanzan `ApiError` → se tratan como error inesperado de la API.
- Ambos se consideran fallos reintentables por la configuración de queries (§5.4);
  "sin resultados" **no** es un error — es una respuesta exitosa con lista vacía.

### 4.4 Códigos meteorológicos WMO → mapeo de condición

Tipos de dominio (`src/types/weather.ts`):

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

El mapeo se implementa como función pura en `src/lib/weatherCodes.ts`
(`getWeatherCondition(code: number): WeatherCondition`); los códigos desconocidos
caen de forma segura en `{ kind: 'overcast', label: 'Condición desconocida' }`.

| Códigos WMO | `kind` | `label` (español, texto de UI) |
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

`WeatherIcon` recibe `kind` e `isDay: boolean` (las variantes día/noche importan
al menos para `clear` y `partly-cloudy`; el resto de kinds puede compartir un solo glifo).

### 4.5 Tipos de dominio

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

`City` se construye a partir de `GeocodingResult` en `api/geocoding.ts` (punto
único de mapeo).

> **v2 (§11.3):** el estado de selección de `App` pasa de `City | null` a
> `SelectedLocation | null` para soportar la ubicación por geolocalización,
> que no tiene id de geocoding. `City` y `FavoriteCity` no cambian (el shape
> persistido en `localStorage` se mantiene intacto).

---

## 5. Diseño de hooks (TanStack Query)

### 5.1 Query keys

Centralizadas en un objeto `queryKeys` (puede vivir en `src/api/client.ts`):

```ts
export const queryKeys = {
  citySearch: (query: string) => ['citySearch', query.trim().toLowerCase()] as const,
  forecast: (lat: number, lon: number) =>
    ['forecast', Number(lat.toFixed(4)), Number(lon.toFixed(4))] as const,
};
```

Las coordenadas se redondean a 4 decimales para que los aciertos de caché sean estables.

### 5.2 `useDebouncedValue<T>(value: T, delayMs = 300): T`

Hook utilitario genérico (timer en `useEffect`). Se mantiene separado para poder
testearlo de forma unitaria con fake timers y reutilizarlo.

### 5.3 `useCitySearch(query: string)`

```ts
function useCitySearch(query: string): UseQueryResult<City[], Error> & { isDebouncing: boolean }
```

- Aplica debounce a `query` internamente con `useDebouncedValue(query, 300)`.
- `enabled: debouncedQuery.trim().length >= 2` (sin peticiones para 0–1 caracteres).
- `queryKey: queryKeys.citySearch(debouncedQuery)`.
- `queryFn: () => searchCities(debouncedQuery)` → devuelve `City[]`.
- `staleTime: Infinity` — los resultados de geocoding para una cadena dada no cambian.
- `placeholderData: keepPreviousData` — los resultados anteriores siguen visibles
  mientras carga la query de la siguiente pulsación (sin parpadeo del dropdown).
- Expone `isDebouncing` (`query !== debouncedQuery`) para que la UI pueda mostrar
  el spinner en cuanto el usuario escribe.

### 5.4 `useWeather`

```ts
// MVP signature; v2 changes the parameter to coordinates (§11.4):
function useWeather(coords: Coordinates | null): UseQueryResult<ForecastResponse, Error>
```

- `enabled: coords !== null`.
- `queryKey: queryKeys.forecast(coords.latitude, coords.longitude)`.
- `queryFn: ({ signal }) => fetchForecast({ latitude, longitude }, signal)`.
- `staleTime: 10 * 60 * 1000` (10 min — el clima no cambia más rápido).
- `refetchOnWindowFocus: true` (por defecto) — el clima obsoleto se refresca
  cuando el usuario vuelve a la pestaña.
- Los componentes derivan los datos a mostrar de `data.current` / `data.daily` +
  `getWeatherCondition`; no hace falta capa de transformación para este tamaño.

Defaults globales del `QueryClient` (en `main.tsx`):

```ts
new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,                    // one retry, then show the error UI
      retryDelay: 1000,
      networkMode: 'offlineFirst', // v2 (§12.4): let the SW answer from cache when offline
    },
  },
});
```

### 5.5 `useFavorites()`

Sin TanStack Query — estado de cliente puro respaldado por `localStorage`.

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

- Un inicializador lazy de `useState` lee la clave y le hace `JSON.parse`;
  cualquier error de parseo o forma inválida → `[]` (nunca romper con storage corrupto).
- Cada mutación escribe de vuelta de forma síncrona con `JSON.stringify`.
- Valor almacenado: `FavoriteCity[]`, deduplicado por `id`, con tope de **10**
  entradas (se descarta la más antigua) para mantener la franja de UI razonable.
- La sincronización entre pestañas vía el evento `storage` es un nice-to-have, **no** MVP.

---

## 6. Manejo de estados de UI

Toda interacción remota tiene un estado visual explícito. Los textos en español
son la redacción final salvo que DESIGN.md los sobrescriba.

| Situación | Detección | UI |
|---|---|---|
| Escribiendo, búsqueda en curso | `isDebouncing \|\| isFetching` en `useCitySearch` | `Spinner` pequeño dentro del input de búsqueda |
| Búsqueda: sin coincidencias | `data.length === 0 && debouncedQuery.length >= 2` | `EmptyState`: "No se encontraron ciudades para «{query}»" |
| Búsqueda: petición fallida | `isError` | Mensaje inline en el dropdown: "No se pudo buscar. Revisa tu conexión." |
| Clima cargando (primera vez) | `isPending` en `useWeather` | Skeleton/spinner sobre el panel de clima |
| Clima refrescándose | `isFetching && !isPending` | Mantener los datos visibles; solo un indicador sutil |
| Clima: error de red/API | `isError` | `ErrorMessage`: "No se pudo cargar el clima. Comprueba tu conexión e inténtalo de nuevo." + botón "Reintentar" que llama a `refetch()` |
| Sin ciudad seleccionada aún | `city === null` | `EmptyState`: "Busca una ciudad para ver el clima" |
| Sin favoritas | `favorites.length === 0` | `EmptyState`: "Aún no tienes ciudades favoritas" |

Mínimos de accesibilidad: resultados del dropdown navegables por teclado (al
menos Enter para elegir el primer resultado), regiones de estado con
`role="status"` / `role="alert"`, iconos con `aria-hidden` más etiquetas de texto visibles.

Los estados de UI nuevos de v2 (día seleccionado, geolocalización, offline)
están en §10.3, §11.5 y §12.5.

---

## 7. Estrategia de testing (Vitest + RTL + MSW)

Configuración: Vitest corre a través de `vite.config.ts` (bloque `test`),
`environment: 'jsdom'`, `setupFiles: ['src/test/setup.ts']`, `globals: true`.
`setup.ts` importa `@testing-library/jest-dom/vitest` y arranca/resetea/detiene
el servidor node de MSW (`beforeAll`/`afterEach`/`afterAll`).

Mocking: **MSW** intercepta `https://geocoding-api.open-meteo.com/*` y
`https://api.open-meteo.com/*`. Los fixtures de `src/test/mocks/fixtures.ts`
están tipados con las interfaces de §4, de modo que cualquier divergencia entre
tipos y fixtures rompe la compilación. Overrides por test vía `server.use(...)`
simulan errores (`HttpResponse.error()` para fallo de red, JSON 400 para errores
de API) y resultados vacíos. `localStorage` se simula por test (jsdom lo
provee; se limpia en `afterEach`).

El helper de test `renderWithQueryClient` envuelve los componentes en un
`QueryClient` nuevo por test con `retry: false` para mantener rápidos los tests de error.

Qué se testea (en orden de prioridad):

1. **`lib/weatherCodes.ts`** (unitario): un código representativo de cada grupo
   mapea al `kind` correcto + etiqueta en español; un código desconocido cae de
   forma segura.
2. **`lib/format.ts`** (unitario): redondeo de temperatura, formateo de viento,
   nombres de día es-ES.
3. **`useFavorites`** (hook, `renderHook`): añadir/quitar/toggle, persistencia en
   `localStorage`, dedupe, tope de 10, JSON corrupto → lista vacía.
4. **`useDebouncedValue`** (hook, fake timers).
5. **Flujo de `CitySearch`** (componente + MSW): escribir ≥2 caracteres muestra
   resultados; respuesta vacía muestra "No se encontraron ciudades…"; error de
   red muestra el mensaje de error; seleccionar un resultado dispara el callback.
6. **Panel de clima** (componente + MSW): renderiza temperatura actual,
   sensación térmica, humedad, viento y 7 tarjetas de pronóstico desde el
   fixture; el fixture de error renderiza `ErrorMessage` y "Reintentar" dispara un refetch.

Los tests nuevos de v2 están en §13.2.

No se testea: el estilo visual, Open-Meteo en sí, ni los códigos WMO de forma
exhaustiva más allá de uno por grupo.

---

## 8. Despliegue estático (sin Docker)

- `npm run build` → `tsc -b && vite build` → assets estáticos en `dist/`.
  SPA puramente estática; sin servidor, sin rewrites (no hay routing en cliente).
- Las llamadas van directamente del navegador a Open-Meteo (CORS abierto); no se
  requiere proxy ni variables de entorno/secretos. Las URLs base son constantes planas.
- Desplegado en **GitHub Pages** vía GitHub Actions (`.github/workflows/ci.yml`):
  el job de deploy pasa `--base="/<repo>/"` por CLI al build; los builds locales
  mantienen `base: '/'`.
- CI (GitHub Actions): `npm ci` → chequeo de tipos → `vitest run` → `vite build`
  en cada push/PR.
- **v2:** el mismo build genera además el service worker y el manifest de la PWA
  (§12.6); el workflow no necesita cambios.

---

# Parte II — Alcance v2

El MVP está construido, desplegado y con QA aprobado. v2 añade tres features
sobre lo existente: **gráfico horario interactivo** (§10), **geolocalización**
(§11) y **PWA** (§12). Los deltas sobre la Parte I ya están marcados allí con
comentarios `v2 (§n)`; esta parte define el diseño de cada feature.

Nada de v2 cambia la estrategia de renderizado: sigue siendo una **SPA estática**
(Vite) — ahora **instalable como PWA** con soporte offline básico (§12).

---

## 9. Dependencias nuevas de v2 (versiones exactas)

Verificadas en npm a fecha **2026-07-17** y compatibles con las dependencias
actuales del `package.json` (React 19.2.7, Vite 8.1.3, TypeScript 6.0.3).
Rangos caret, como en §3.

**dependencies**

| Paquete | Versión | Para qué |
|---|---|---|
| `recharts` | 3.9.2 | Gráfico horario (§10). Peer `react ^19.0.0` explícito. |
| `react-is` | 19.2.7 | Peer dependency requerida por recharts; se fija explícitamente para alinearla con React 19.2.7. |

**devDependencies**

| Paquete | Versión | Para qué |
|---|---|---|
| `vite-plugin-pwa` | 1.3.0 | PWA (§12). Soporta Vite 8 (peer `vite ^8.0.0`); arrastra `workbox-build` y `workbox-window` 7.4.1 como dependencias propias — no hay que declararlas. |

La geolocalización no añade dependencias: usa la Geolocation API y la
Permissions API nativas del navegador.

---

## 10. Gráfico horario interactivo

Curva de temperatura y barras de precipitación por horas del día seleccionado
en el pronóstico de 7 días, con tooltip.

### 10.1 Librería: Recharts 3.9.2

| Criterio | Evaluación |
|---|---|
| Compatibilidad React 19 | Peer `react ^19.0.0` explícito; componentes declarativos que encajan con el modelo del proyecto. |
| TypeScript | Tipos incluidos en el paquete (`types/index.d.ts`); API tipada sin `@types/*` extra. |
| Tooltip | Integrado (`<Tooltip content={...} />`) y personalizable con un componente propio — requisito directo del alcance. |
| Accesibilidad | En v3 el `accessibilityLayer` viene **activado por defecto**: el gráfico es enfocable y navegable con teclado (las flechas mueven el cursor/tooltip), con roles ARIA. Ninguna alternativa lo da gratis. |
| Peso del bundle | Su contra: ~100 kB gzip (arrastra `victory-vendor`/d3). Mitigación en §10.4: `HourlyChart` se carga con `React.lazy`, así recharts vive en un chunk aparte que no penaliza la carga inicial (y el SW lo precachea igualmente, §12.3). |

Alternativas descartadas:

- **chart.js 4 + react-chartjs-2** — más ligera (~70 kB) y muy extendida, pero
  renderiza a `<canvas>`: opaco para lectores de pantalla (la a11y habría que
  construirla a mano con un fallback DOM) y API de objeto de configuración,
  ajena al modelo declarativo de React que este portafolio quiere demostrar.
- **visx** — la opción más ligera y modular, pero de bajo nivel: ejes, tooltip,
  escalas e interacción se ensamblan a mano. Demasiado código para un único gráfico.
- **nivo** — declarativa y con buena DX, pero de peso comparable a recharts sin
  su capa de accesibilidad por defecto; no aporta nada diferencial aquí.

### 10.2 Datos: extensión del forecast

- La query de forecast añade `hourly=temperature_2m,precipitation,precipitation_probability`
  (ya reflejado en §4.2). Una sola petición sigue cubriendo todo el panel:
  sin endpoints nuevos, sin queries nuevas, la caché de TanStack Query no cambia.
- `HourlyForecast` son arrays paralelos de 168 entradas (24 × 7 días) en hora
  local (`timezone=auto`), con la misma nulabilidad que `DailyForecast`.
- El recorte por día es una función pura en `src/lib/hourly.ts`:

```ts
/** One chart point. Nulls are preserved; recharts renders them as gaps. */
export interface HourlyPoint {
  time: string;                             // "2026-07-17T14:00"
  hourLabel: string;                        // "14:00" (X-axis / tooltip)
  temperature: number | null;               // °C
  precipitation: number | null;             // mm
  precipitationProbability: number | null;  // %
}

/**
 * Extracts the hourly points whose `time` starts with `date` ("YYYY-MM-DD",
 * taken from daily.time[selectedDayIndex]). Prefix matching instead of
 * index arithmetic (dayIndex * 24) keeps it correct even if Open-Meteo
 * emits an irregular number of hours (DST days) and plays well with
 * noUncheckedIndexedAccess.
 */
export function selectHourlyForDay(hourly: HourlyForecast, date: string): HourlyPoint[];
```

### 10.3 Estado "día seleccionado"

- `WeatherPanel` (que ya posee `useWeather`) añade
  `const [selectedDayIndex, setSelectedDayIndex] = useState(0)` — por defecto
  hoy (índice 0). El estado se **resetea a 0 al cambiar de ubicación** (vía
  prop `key` derivada de las coordenadas en el subárbol de contenido; sin `useEffect`).
- `ForecastList` recibe `selectedDayIndex` y `onSelectDay(index)`;
  `ForecastDayCard` pasa a renderizarse como `<button type="button">` con
  `aria-pressed={isSelected}` y estado visual de seleccionado (lo define
  DESIGN.md). El contenedor lleva `role="group"` +
  `aria-label="Selecciona un día para ver el detalle por horas"`.
- Flujo de datos: `daily.time[selectedDayIndex]` (acceso comprobado —
  `noUncheckedIndexedAccess`) → `selectHourlyForDay(data.hourly, date)` →
  `HourlyChart`.

### 10.4 Componentes

- **`HourlyChart.tsx`** — presentacional puro: recibe `points: HourlyPoint[]`,
  `units: HourlyForecastUnits` y `title` (p. ej. "Pronóstico por horas ·
  jueves 17"). Composición recharts:
  - `ResponsiveContainer` + `ComposedChart`.
  - `Line` monotónica para `temperature` (eje Y izquierdo, °C).
  - `Bar` para `precipitation` (eje Y derecho, mm).
  - `XAxis dataKey="hourLabel"` con ticks cada 3 horas (`interval={2}`).
  - `Tooltip content={<HourlyChartTooltip />}`.
  - Colores y tipografía desde los tokens de DESIGN.md.
- **`HourlyChartTooltip.tsx`** — tooltip propio en español: hora, temperatura,
  precipitación (mm) y probabilidad (%), formateados con `lib/format.ts`.
- **Carga diferida**: `WeatherPanel` importa el chart con
  `const HourlyChart = lazy(() => import('./HourlyChart'))` dentro de un
  `<Suspense fallback={<esqueleto del chart>}>`. Recharts queda en un chunk
  separado del bundle inicial.
- Encabezado del bloque con el día seleccionado (`role="heading"` implícito con
  `<h2>/<h3>`), de modo que el cambio de día sea perceptible también sin ver el gráfico.

### 10.5 Estados de UI del gráfico

| Situación | Detección | UI |
|---|---|---|
| Chunk del chart cargando | `Suspense` fallback | Skeleton con la misma altura reservada (sin layout shift) |
| Día sin datos horarios | `points.length === 0` o todos `null` | `EmptyState` compacto: "Sin datos horarios para este día" |
| Cambio de día | click/Enter en `ForecastDayCard` | El heading y el gráfico se actualizan; sin spinner (los 7 días ya están en memoria) |

### 10.6 Qué se testea

1. **`lib/hourly.ts`** (unitario, prioridad máxima): recorte correcto por fecha
   (día 0 y día 6), preservación de `null`, día inexistente → `[]`,
   `hourLabel` bien derivado.
2. **Selección de día** (componente): click en la tarjeta del día 2 actualiza
   `aria-pressed` y el heading del bloque horario; cambiar de ciudad resetea a hoy.
3. **`HourlyChart`** (smoke test): con un fixture de 24 puntos renderiza el
   título y la región accesible del gráfico. En jsdom `ResponsiveContainer`
   mide 0×0: los tests fijan dimensiones explícitas (o mockean el container).
   **No** se testean paths SVG ni el layout del chart — eso es de recharts.

---

## 11. Geolocalización

Al abrir la app se ofrece el clima de la ubicación actual usando la browser
Geolocation API, con los tres casos manejados: concedido, denegado, no soportado.

### 11.1 Flujo de UX

No se dispara el prompt de permiso al cargar la página (mala práctica que los
navegadores penalizan). En su lugar:

1. Al montar, se consulta la **Permissions API** (`navigator.permissions.query({ name: 'geolocation' })`):
   - `granted` → se piden las coordenadas en silencio (no habrá prompt) y se
     selecciona "Tu ubicación" automáticamente **solo si el usuario aún no ha
     seleccionado nada** (nunca se pisa una selección manual ni una favorita ya elegida).
   - `prompt` (o Permissions API no disponible) → se muestra un banner con el
     botón "Usar mi ubicación"; el prompt del navegador solo aparece tras ese clic.
   - `denied` → banner informativo, sin botón.
2. Si `navigator.geolocation` no existe → caso **no soportado**: no se muestra
   nada relacionado con ubicación (la búsqueda manual es el flujo normal).

### 11.2 Hook `useGeolocation` — máquina de estados

`src/hooks/useGeolocation.ts`, sin TanStack Query (no es estado de servidor):

```ts
export type GeolocationStatus =
  | 'unsupported' // navigator.geolocation is undefined
  | 'idle'        // supported, permission not requested yet (Permissions API: 'prompt')
  | 'requesting'  // getCurrentPosition in flight
  | 'granted'     // coords available
  | 'denied'      // user denied (GeolocationPositionError.PERMISSION_DENIED or Permissions API 'denied')
  | 'error';      // POSITION_UNAVAILABLE or TIMEOUT

export function useGeolocation(): {
  status: GeolocationStatus;
  coords: Coordinates | null;   // non-null only when status === 'granted'
  requestLocation: () => void;  // idempotent while 'requesting'
};
```

Transiciones:

```
mount ─ no navigator.geolocation ──────────────► unsupported (terminal)
mount ─ permissions: 'denied' ─────────────────► denied
mount ─ permissions: 'granted' ── auto request ► requesting
mount ─ permissions: 'prompt' | API missing ───► idle
idle ── requestLocation() ─────────────────────► requesting
requesting ─ success ──────────────────────────► granted (+ coords)
requesting ─ error code 1 (PERMISSION_DENIED) ─► denied
requesting ─ error code 2 | 3 ─────────────────► error   (retry allowed → requesting)
```

Opciones de `getCurrentPosition`:
`{ enableHighAccuracy: false, timeout: 10_000, maximumAge: 5 * 60_000 }`
(precisión de ciudad es suficiente; 10 s de timeout; se acepta una posición
cacheada de hasta 5 min).

### 11.3 Modelado: `SelectedLocation` (coords sin id de geocoding)

Open-Meteo **no ofrece reverse geocoding** (su Geocoding API solo busca por
nombre), y añadir otra API de terceros rompería la premisa "solo Open-Meteo,
sin API key". Decisión: la ubicación actual se muestra con la etiqueta fija
**"Tu ubicación"**, sin resolver el nombre de la ciudad.

Nuevo tipo en `src/types/weather.ts`; mappers puros en `src/lib/location.ts`:

```ts
/** What the app displays weather for: a searched city or the user's position. */
export interface SelectedLocation {
  latitude: number;
  longitude: number;
  /** UI heading: city name, or "Tu ubicación" for geolocation. */
  label: string;
  /** Secondary line (admin1, country); absent for geolocation. */
  sublabel?: string;
  /** Present when it came from search/favorites; enables the favorite toggle. */
  city?: City;
}

// src/lib/location.ts (pure)
export function cityToLocation(city: City): SelectedLocation;
export function currentPositionToLocation(coords: Coordinates): SelectedLocation; // label: 'Tu ubicación'
```

Por qué esta forma y no una unión discriminada sobre `City`: añadir un
discriminante a `City` cambiaría el shape ya persistido de favoritas en
`localStorage`; `SelectedLocation` deja `City`/`FavoriteCity` intactos y hace
opcional lo único que la geolocalización no tiene (identidad de geocoding).
Consecuencia asumida: **"Tu ubicación" no puede marcarse favorita** (no hay id
estable); el `FavoriteToggleButton` solo se renderiza cuando `city` está presente.

### 11.4 Integración

- `App`: `useState<SelectedLocation | null>`; `CitySearch` y `FavoritesList`
  siguen emitiendo `City`, que `App` envuelve con `cityToLocation`.
- `useWeather` cambia su firma a `useWeather(coords: Coordinates | null)`
  (§5.4). La query key no cambia (`queryKeys.forecast(lat, lon)`), así que la
  caché por coordenadas funciona igual para ciudades y geolocalización.
- Auto-selección: un `useEffect` en `App` observa
  `geolocation.status === 'granted'` y hace
  `setSelectedLocation((prev) => prev ?? currentPositionToLocation(coords))`.

### 11.5 Estados de UI (`GeolocationBanner`)

| `status` | UI |
|---|---|
| `unsupported` | No se renderiza nada. |
| `idle` | Banner con botón "Usar mi ubicación". |
| `requesting` | Botón deshabilitado + spinner: "Obteniendo tu ubicación…" (`role="status"`). |
| `granted` | El banner desaparece; el panel muestra "Tu ubicación" como encabezado. |
| `denied` | Texto informativo, descartable: "Permiso de ubicación denegado. Puedes buscar tu ciudad manualmente." (sin reintento: el permiso se gestiona en el navegador). |
| `error` | "No se pudo obtener tu ubicación." + botón "Reintentar" → `requestLocation()`. |

### 11.6 Testing (mock de `navigator.geolocation`)

jsdom no implementa Geolocation ni Permissions API, así que
`src/test/mocks/geolocation.ts` expone un helper que instala mocks con
`Object.defineProperty(navigator, 'geolocation' | 'permissions', { value, configurable: true })`
y los restaura en `afterEach`. El mock de `getCurrentPosition` invoca el
callback de éxito con coords fijas o el de error con
`{ code: 1 | 2 | 3, message }` según configure cada test.

Casos (con `renderHook`):

1. Sin `geolocation` en navigator → `unsupported`.
2. Permissions `granted` → auto-request → `granted` + coords.
3. Permissions `prompt` → `idle`; `requestLocation()` → `requesting` → `granted`.
4. Error código 1 → `denied`; código 3 (timeout) → `error` y reintento posible.
5. Permissions API ausente → `idle` (fallback).

Integración (componente + MSW): con el mock en éxito, `App` muestra el panel
con encabezado "Tu ubicación" y los datos del fixture de forecast; el toggle de
favorita **no** aparece.

---

## 12. PWA: instalable + offline básico

### 12.1 Estrategia

**`vite-plugin-pwa` 1.3.0** con la estrategia por defecto **`generateSW`**
(Workbox genera el service worker a partir de configuración declarativa) y
`registerType: 'autoUpdate'`.

- `generateSW` frente a `injectManifest` (SW escrito a mano): no hay lógica
  custom que justifique mantener un SW propio; precache + runtime caching se
  expresan por configuración.
- `autoUpdate` frente a `prompt`: el SW nuevo se activa solo y toma control en
  la siguiente carga; se evita construir UI de "hay una nueva versión". Adecuado
  para un portafolio sin estado crítico en sesión.
- `devOptions.enabled: false`: el SW solo existe en build/preview; ni el dev
  server ni Vitest lo ven (cero interferencia con MSW).

### 12.2 Manifest e instalabilidad

En `vite.config.ts` (los **valores visuales finales — colores e iconos — los
fija DESIGN.md**; aquí van forma y claves):

```ts
VitePWA({
  registerType: 'autoUpdate',
  includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
  manifest: {
    name: 'Clima — Pronóstico del tiempo',
    short_name: 'Clima',
    description: 'Clima actual y pronóstico de 7 días con Open-Meteo',
    lang: 'es',
    display: 'standalone',
    theme_color: '/* DESIGN.md token */',
    background_color: '/* DESIGN.md token */',
    icons: [
      { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
      { src: 'pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  },
  workbox: { /* §12.3 */ },
  devOptions: { enabled: false },
})
```

- `start_url` y `scope` **no se hardcodean**: el plugin los deriva del `base`
  de Vite, que en GitHub Pages llega por CLI (§8) — funciona igual en local y en Pages.
- Los PNG (192, 512, 512 maskable, apple-touch-icon 180) los produce el
  diseñador y viven en `public/`.
- `index.html` añade `<meta name="theme-color">` y
  `<link rel="apple-touch-icon">` (iOS ignora el manifest para el icono).

### 12.3 Estrategia de caché

**Precache (app shell)** — Workbox precachea todo el output de build
(`globPatterns: ['**/*.{js,css,html,svg,png,woff2}']`), incluido el chunk lazy
de recharts. `navigateFallback` por defecto (`index.html`): la app abre offline.

**Runtime caching (APIs de Open-Meteo)**:

```ts
workbox: {
  globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
  runtimeCaching: [
    {
      // Forecast: fresh if possible, last successful response when offline
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
      // Geocoding: results for a given query are immutable (mirrors staleTime: Infinity)
      urlPattern: ({ url }) => url.origin === 'https://geocoding-api.open-meteo.com',
      handler: 'CacheFirst',
      options: {
        cacheName: 'geocoding-api',
        expiration: { maxEntries: 50, maxAgeSeconds: 7 * 24 * 60 * 60 }, // 7 d
        cacheableResponse: { statuses: [0, 200] },
      },
    },
  ],
}
```

- **Forecast → `NetworkFirst`**: con red se muestra clima fresco; sin red (o
  red lenta > 4 s) responde la **última consulta exitosa** cacheada — el
  requisito literal del alcance. Se descartó `StaleWhileRevalidate` porque
  mostraría clima obsoleto sin avisar aun teniendo red.
- **Geocoding → `CacheFirst`**: coherente con el `staleTime: Infinity` de la
  app; además permite repetir búsquedas recientes offline.
- Registro en `main.tsx`:

```ts
import { registerSW } from 'virtual:pwa-register';
registerSW({ immediate: true }); // no-op where serviceWorker is unavailable (jsdom, dev)
```

  más `/// <reference types="vite-plugin-pwa/client" />` en `src/vite-env.d.ts`
  para tipar el módulo virtual.

### 12.4 TanStack Query y offline: `networkMode: 'offlineFirst'`

El default de TanStack Query (`networkMode: 'online'`) **pausa** las queries
cuando `navigator.onLine === false`, de modo que el `fetch` nunca se dispara y
el service worker jamás tendría ocasión de responder desde caché. Se fija
`networkMode: 'offlineFirst'` en los defaults del `QueryClient` (ya marcado en
§5.4): el primer intento siempre se lanza — online lo responde la red; offline
lo responde el SW (`NetworkFirst` fallback) o falla al `ErrorMessage` existente
si no hay nada cacheado.

### 12.5 Detección de offline en la UI

- **`useOnlineStatus(): boolean`** (`src/hooks/useOnlineStatus.ts`):
  `useSyncExternalStore` suscrito a los eventos `online`/`offline` de `window`,
  con `navigator.onLine` como snapshot. Sin dependencias.
- **`OfflineBanner`** (`src/components/ui/OfflineBanner.tsx`): franja fija con
  `role="status"`: **"Sin conexión. Se muestran los últimos datos disponibles."**
  Se renderiza en `App` cuando `useOnlineStatus()` devuelve `false` y desaparece
  al reconectar.

| Situación | Comportamiento |
|---|---|
| Offline + forecast en caché del SW | Banner visible; las queries resuelven desde caché y los datos se muestran con normalidad. |
| Offline + sin caché para esas coords | Banner visible + `ErrorMessage` de red existente (con "Reintentar"). |
| Vuelve la conexión | El banner desaparece; el `refetchOnWindowFocus`/reintentos normales refrescan datos. |

### 12.6 Build, deploy y CI

- `vite build` pasa a emitir también `sw.js`, `workbox-*.js` y
  `manifest.webmanifest` dentro de `dist/`; el artefacto de Pages los incluye
  sin tocar el workflow (`.github/workflows/ci.yml` queda como está).
- GitHub Pages sirve por HTTPS (requisito de SW) y el scope del SW queda bajo
  `/<repo>/` gracias al `base` por CLI — correcto para un project site.
- Verificación local: `npm run build && npm run preview` (el SW no existe en `npm run dev`).
- QA valida instalabilidad y offline con Lighthouse (categoría PWA) y el modo
  offline de DevTools; no se testea el SW unitariamente (es un artefacto
  generado por Workbox, §13.2).

---

## 13. Decisiones v2 y testing

### 13.1 Resumen de decisiones

| Decisión | Elección | Alternativas descartadas |
|---|---|---|
| Librería de charts | **Recharts 3.9.2**, lazy-loaded | chart.js (canvas, a11y manual), visx (bajo nivel, más código), nivo (peso similar sin a11y por defecto) — §10.1 |
| Datos horarios | Ampliar la query de forecast existente con `hourly=` | Segunda query/endpoint dedicado: petición extra sin beneficio; Open-Meteo lo devuelve todo junto |
| Recorte por día | Función pura por prefijo de fecha (`lib/hourly.ts`) | Aritmética `dayIndex * 24`: frágil ante días DST y peor con `noUncheckedIndexedAccess` |
| Estado día seleccionado | `useState` local en `WeatherPanel`, reset por `key` | Estado global/URL: sin routing no aporta nada |
| Nombre de la ubicación actual | Etiqueta fija "Tu ubicación" | Reverse geocoding: Open-Meteo no lo ofrece; otra API de terceros rompe "solo Open-Meteo, sin key" |
| Modelado de selección | `SelectedLocation` con `city?: City` | Unión discriminada sobre `City`: cambiaría el shape persistido de favoritas |
| Favorita de geolocalización | No permitida (sin id estable) | Ids sintéticos negativos: complejidad y semántica confusa en favoritas |
| Prompt de permiso | Solo tras clic (Permissions API decide el estado inicial) | Prompt al cargar: mala práctica, penalizada por los navegadores |
| Plugin PWA | `vite-plugin-pwa` 1.3.0, `generateSW`, `autoUpdate` | `injectManifest` (SW a mano) innecesario; `prompt` de actualización: UI extra sin valor aquí |
| Caché de forecast | `NetworkFirst` (timeout 4 s, 6 h) | `StaleWhileRevalidate`: mostraría clima obsoleto sin avisar teniendo red |
| Caché de geocoding | `CacheFirst` (7 días) | `NetworkFirst`: los resultados por query son inmutables; no aporta |
| Queries offline | `networkMode: 'offlineFirst'` | Default `'online'`: pausa las queries offline y el SW nunca respondería |

### 13.2 Qué se testea en v2

Se añade a la lista de §7 (mismas herramientas: Vitest + RTL + MSW; los
fixtures de forecast ganan los arrays `hourly`, tipados contra §4.2):

7. **`lib/hourly.ts`** (unitario): recorte por fecha, nulls, día sin datos,
   `hourLabel` (§10.6).
8. **Selección de día** (componente + MSW): `aria-pressed`, heading del bloque
   horario, reset al cambiar de ciudad (§10.6).
9. **`HourlyChart`** (smoke test con dimensiones fijas): título + región
   accesible; sin asserts sobre SVG (§10.6).
10. **`useGeolocation`** (hook + mock de `navigator.geolocation`/`permissions`):
    las cinco transiciones de §11.6.
11. **Integración de geolocalización** (componente + MSW): "Tu ubicación" con
    datos del fixture; sin toggle de favorita (§11.6).
12. **`useOnlineStatus`** (hook): responde a los eventos `online`/`offline`;
    `OfflineBanner` aparece/desaparece.
13. **`lib/location.ts`** (unitario trivial): mapeos `cityToLocation` /
    `currentPositionToLocation`.

**No se testea**: el service worker ni el manifest (artefactos generados por
Workbox; los valida QA con Lighthouse y DevTools offline, §12.6), ni el
renderizado interno de recharts.
