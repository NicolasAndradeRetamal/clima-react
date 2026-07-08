# ARCHITECTURE — clima-react

Aplicación de clima. Proyecto de portafolio, **frontend-only**: React + TypeScript
consumiendo las APIs públicas de Open-Meteo (sin API key, sin backend propio).
Este documento es el contrato para el agente frontend: estructura de carpetas,
versiones de dependencias, contrato de la API, diseño de hooks, manejo de estados
de UI, testing y despliegue.

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

### 4.2 Forecast (clima actual + 7 días)

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
único de mapeo). La `City` seleccionada vive en el estado de `App`
(`useState<City | null>`).

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

### 5.4 `useWeather(city: City | null)`

```ts
function useWeather(city: City | null): UseQueryResult<ForecastResponse, Error>
```

- `enabled: city !== null`.
- `queryKey: queryKeys.forecast(city.latitude, city.longitude)`.
- `queryFn: () => fetchForecast({ latitude, longitude })`.
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

No se testea: el estilo visual, Open-Meteo en sí, ni los códigos WMO de forma
exhaustiva más allá de uno por grupo.

---

## 8. Despliegue estático (sin Docker)

- `npm run build` → `tsc -b && vite build` → assets estáticos en `dist/`.
  SPA puramente estática; sin servidor, sin rewrites (no hay routing en cliente).
- Las llamadas van directamente del navegador a Open-Meteo (CORS abierto); no se
  requiere proxy ni variables de entorno/secretos. Las URLs base son constantes planas.
- La plataforma de destino la decide el agente devops; ambas son triviales:
  - **GitHub Pages**: fijar `base: '/clima-react/'` en `vite.config.ts` (o
    `base: './'`) y desplegar `dist/` vía GitHub Actions.
  - **Vercel/Netlify**: cero configuración (build command `npm run build`, output `dist`).
- CI (GitHub Actions): `npm ci` → chequeo de tipos equivalente a `tsc -b --noEmit` →
  `vitest run` → `vite build` en cada push/PR.
